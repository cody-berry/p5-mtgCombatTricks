/**
 *  @author Cody
 *  @date 2023.01.20
 *
 */

let font
let fixedWidthFont
let variableWidthFont
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */
// scryfall data url; BRO (the BROther's War)
let url='https://api.scryfall.com/cards/search?q=set:woe'
let cards=[] /* data for the cards */
let mana = [0,0,0,0,0,0] /* mana in WUBRG order, then colorless mana */
let whiteIcon
let blueIcon
let blackIcon
let redIcon
let greenIcon
let colorlessIcon
let phyrexianIcon
let whiteColor
let blueColor
let blackColor
let redColor
let greenColor
let colorlessColor
let availableCardImages = {} // what cards can we cast?
let raritiesSelected = { // the rarites that have been selected
    'common': true,
    'uncommon': true,
    'rare': true,
    'mythic': true
}

let hoveringOverImage = false

function preload() {
    font = loadFont('data/consola.ttf')
    fixedWidthFont = loadFont('data/consola.ttf')
    variableWidthFont = loadFont('data/meiryo.ttf')

    loadJSON(url, printAndPaginateData)
    loadJSON('https://api.scryfall.com/cards/search?q=set:wot', printAndPaginateData)

    // iterate through all the mana symbols and load them
    whiteIcon = loadImage('svg/w.svg')
    blueIcon = loadImage('svg/u.svg')
    blackIcon = loadImage('svg/b.svg')
    redIcon = loadImage('svg/r.svg')
    greenIcon = loadImage('svg/g.svg')
    colorlessIcon = loadImage('svg/c.svg')
    phyrexianIcon = loadImage('svg/p.svg')
}

// paginates the data if necessary, then filters the instants and flash cards
function printAndPaginateData(data) {
    let currentCards = data['data']
    // add the data to the json
    cards = [ ...cards, ...currentCards] /* spread operator: ... */

    if (data['has_more']) {
        loadJSON(data['next_page'], printAndPaginateData)
    }


    cards = filterInstantsAndFlashCards(cards)
}

function setup() {
    let cnv = createCanvas(700, 3000)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)

    print(cards)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
        numpad 1 → freeze sketch
        W, U, B, R, G, C, or click on symbol → Add 1 mana
        w, u, b, r, g, or c → Remove 1 White/Blue/Black/Red/Green/Colorless mana
        z → Display all available combat tricks <b>⚠ Do NOT press 'z' twice ⚠
        
        Hover over a card to display the trick in the middle of the screen.
        The hovered combat trick cannot change while you are hovering over the 
        image displayed in the middle of the screen.
        Please do not reduce width below the canvas width
        </b></pre>`)

    // create all the Color functions
    // where are all the colors?
    let colors = {"W": [59, 25, 95],
                  "U": [192, 40, 93],
                  "B": [0, 3, 47],
                  "R": [5, 70, 84],
                  "G": [155, 95, 71],
                  "C": [240, 2, 87]}

    whiteColor = new Color('White', whiteIcon, colors.W, 50, 50)
    blueColor = new Color('Blue', blueIcon, colors.U, 100, 50)
    blackColor = new Color('Black', blackIcon, colors.B, 150, 50)
    redColor = new Color('Red', redIcon, colors.R, 200, 50)
    greenColor = new Color('Green', greenIcon, colors.G, 250, 50)
    colorlessColor = new Color('Colorless', colorlessIcon, colors.C, 300, 50)

    // our debug corner
    debugCorner = new CanvasDebugCorner(5)

    frameRate(1000)

    /* accessing css stylesheet to set it to
     * following CSS: */
    /* background-image: linear-gradient(
     *   rgba(13, 13, 40, 0.3),
     *   rgba(13, 13, 40, 0.5),
     *   url("wallpapers/???"));*/
    /* where ??? is a random wallpaper from the wallpapers directory. */
    let css = select("body")
    let wallpapers = ["WOE/211.jpg", "WOE/218.jpg"]
    // css.style("background-color", "orange")
    print("linear-gradient(\n" +
        "rgba(13, 13, 40, 0.3), \n" +
        "rgba(13, 13, 40, 0.5), \n" +
        "url(\"wallpapers/" +
        wallpapers[floor(random() * wallpapers.length)] +
        "\"))")
    // print("url(\"wallpapers/" +
    //     wallpapers[floor(random() * wallpapers.length)] +
    //     "\")")
    // css.style("background-image", "url(\"wallpapers/" +
    //                               wallpapers[floor(random() * wallpapers.length)] +
    //                               "\")")
    css.style("background-image", "linear-gradient(\n" +
                                  "rgba(13, 13, 40, 0.3), \n" +
                                  "rgba(13, 13, 40, 0.5)), \n" +
                                  "url(\"wallpapers/" +
                                  wallpapers[floor(random() * wallpapers.length)] +
                                  "\")")
    // css.style("background-repeat", "no-repeat")
    // css.style("background-attachment", "fixed")
    // css.style("background-position", "center")
    // css.style("background-size", "cover")
    // css.style("color", "gainsboro")
}

function filterInstantsAndFlashCards(cards) {
    // instants and flash cards
    let resultingCardList = []
    for (let card of cards) {
        if (card["card_faces"]) {
            for (let cardFace of card["card_faces"]) {
                print(`${cardFace['name']} ${cardFace['mana_cost']}\n` +
                    `${cardFace['type_line']}\n${cardFace['oracle_text']}\n` +
                    (("power" in cardFace) ? `${cardFace["power"]}/${cardFace["toughness"]}` : ``))
            }
        } else {
            // type_line is the type of the card. If it is an Instant, then it
            // is a combat trick.
            if (card['type_line'].includes('Instant')) {
                resultingCardList.push(card)
            }
            // it may also be a combat trick if the card keywords includes
            // Flash. For example, in BRO, Zephyr Sentinel or Ambush Paratrooper.
            if (card['keywords'].includes('Flash')) {
                resultingCardList.push(card)
            }
        }
    }
    return resultingCardList
}

function draw() {
    clear()
    background(234, 34, 24, 50)

    // formatting: displaying it's mana selection
    fill(100)
    textFont(variableWidthFont)
    stroke(100)
    strokeWeight(0.5)
    text('Mana selection', 4, 25)

    // draw all the Color classes each frame
    whiteColor.draw()
    blueColor.draw()
    blackColor.draw()
    redColor.draw()
    greenColor.draw()
    colorlessColor.draw()

    // formatting: split between mana and rarities

    fill(237, 37, 20, 50)
    rect(345, 0, 355, 195)

    // formatting: saying that it's rarity selection section
    fill(100)
    textFont(variableWidthFont)
    stroke(100)
    strokeWeight(0.5)
    text('Rarity selection', 360, 25)

    // common
    fill(240, 10, 50)
    if (!raritiesSelected['common']) {
        fill(240, 12, 30)
    }
    noStroke()
    rect(375, 50, 410, 85)
    fill(60, 10, 70)
    textSize(20)
    text('C', 385, 75)

    // uncommon
    fill(240, 8, 100)
    if (!raritiesSelected['uncommon']) {
        fill(240, 8, 80)
    }
    rect(420, 50, 455, 85)
    fill(60, 8, 40)
    text('U', 430, 75)

    // rare
    fill(51, 45, 90)
    if (!raritiesSelected['rare']) {
        fill(51, 45, 60)
    }
    rect(465, 50, 500, 85)
    fill(51, 100, 35)
    text('R', 475, 75)

    // mythic
    fill(35, 57, 100)
    if (!raritiesSelected['mythic']) {
        fill(35, 57, 60)
    }
    rect(510, 50, 545, 85)
    fill(35, 100, 36)
    text('M', 520, 75)

    textSize(14)

    // formatting: split between cards able to be cast and mana symbols
    fill(237, 37, 20, 50)
    rect(0, 195, 700, 205)

    strokeWeight(0.5)
    fill(100)

    // formatting: displaying that the next part is cards able to be cast
    text('Cards able to be cast', 4, 225)
    noStroke()
    fill(237, 37, 20, 50)
    rect(0, 229, 700, 233)

    // how wide is a column, and how high is a row?
    let colWidth = 125
    let rowHeight = 172

    // the space between card CMCs and the number of the spaces between card
    // CMCs we have. otherwise a card will eventually overlap with the
    // spacing between.
    let cardCMCs = 0
    let cardCMCSpacingHeight = 17

    // used to define the position of the next card
    let col = 0
    let row = 0

    hoveringOverImage = false

    // iterate through all the card CMCs
    for (let cardCMC in availableCardImages) {
        // mana symbol: circle + CMC
        fill(50)
        ellipse(40, 260 + row*rowHeight + cardCMCs*cardCMCSpacingHeight, 30)
        fill(100)
        stroke(100)
        textAlign(CENTER)
        text(cardCMC, 40, 265 + row*rowHeight + cardCMCs*cardCMCSpacingHeight)
        col = 0

        for (let card of availableCardImages[cardCMC]) {
            // each card is a new column. the first card is always in column 1.
            col += 1

            // handles col > 4 so that cards wrap so that you can only have
            // values of 1, 2, 3, or 4.
            if (col > 4) {
                col = 1
                row++
            }

            // changes the position of the card
            card.changePos(-50 + col*colWidth, 240+(row)*rowHeight + cardCMCs*cardCMCSpacingHeight)

            // make sure all the tricks are showed
            card.setShow(true)

            // check if it is hovered
            card.draw()
        }
        row++
        cardCMCs++

        noStroke()
        fill(237, 37, 20, 50)
        rect(-10, 225+row*rowHeight + cardCMCs*cardCMCSpacingHeight, 800, 235+row*rowHeight + cardCMCs*cardCMCSpacingHeight)
    }

    // now we have to find what card is overed over if there is. to do this
    // we iterate through all the values of availableCardImages and figure out
    // if they are hovered and draw the big image if so.
    for (let cardCMC in availableCardImages) {
        for (let trick of availableCardImages[cardCMC]) {
            trick.checkIsHovered()
            trick.drawBigImage()
        }
    }

    if (frameCount > 30000)
        noLoop()

    textAlign(LEFT)

    /* debugCorner needs to be last so its z-index is highest */
    if (frameCount % 60 === 0) {
        debugCorner.setText(`frameCount: ${frameCount}`, 2)
        debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    }
    debugCorner.showBottom()
}

// Who knows what you can or cannot cast without a function?
function storeAvailableCards() {
    availableCardImages = {} // the available cards in a dictionary with keys
                             // of cmc's and values of a list of card images
    for (let card of cards) {
        let genericManaOmitted = 0
        let cardCMC = card['cmc']
        // if 'This spell costs' and 'less to cast' are in the string...
        let thisSpellCostsIndex = card['oracle_text'].indexOf(
            'This spell costs')
        if (thisSpellCostsIndex !== -1) {
            let lessToCastIndex = card['oracle_text'].indexOf('less to cast')

            if (lessToCastIndex !== -1) {
                // We iterate through the mana cost. If it can be translated
                // to a number, we break from the loop and set it to
                // genericMana if it is not an X.
                for (let char of card['mana_cost']) {
                    print(char)
                    if (char !== 'X' && char !== '{' && char !== '}') {
                        genericManaOmitted = char*1
                        break
                    }
                }
            }
        }

        if (cardCMC - genericManaOmitted > sum(mana)) {
            if (card["oracle_text"].indexOf("Convoke") === -1) {
                continue
            }
        } if (/* the rarity could
         sometimes not be
         selected!*/ !raritiesSelected[card['rarity']]) {
        } else {
            let cardCost = card['mana_cost']
            let manaMinusUsed = {
                'W': mana[0], // mana[0] = white mana
                'U': mana[1], // mana[1] = blue mana
                'B': mana[2], // mana[2] = black mana
                'R': mana[3], // mana[3] = red mana
                'G': mana[4]  // mana[4] = green mana
            } // colorless mana is not included because we ignore numbers

            let cannotCastCard = false
            for (let char of cardCost) {
                if (['W', 'U', 'B', 'R', 'G'] // characters to be selected
                      .includes(char) && !cannotCastCard) {
                    manaMinusUsed[char] -= 1 // char's gonna be W, U, B, R, or G
                    if (manaMinusUsed[char] < 0) {
                        cannotCastCard = true
                    }
                }
            }
            if (!cannotCastCard) {
                loadImage(card['image_uris']['png'],
                    data => {
                        loadImage(card['image_uris']['png'], data2 => {
                            // the Trick for displaying
                            let newTrick = new Trick(data, 0, 0, 120, data2)
                            newTrick.setShow(false)

                            print(cardCMC, card['name'], genericManaOmitted)

                            //
                            if (card["oracle_text"].indexOf("Convoke") !== -1) {
                                if (availableCardImages[0]) {
                                    availableCardImages[0].push(newTrick)
                                } else {
                                    availableCardImages[0] = [newTrick]
                                }
                            }
                            else {
                                if (availableCardImages[cardCMC - genericManaOmitted]) {
                                    availableCardImages[cardCMC - genericManaOmitted].push(newTrick)
                                } else {
                                    availableCardImages[cardCMC - genericManaOmitted] = [newTrick]
                                }
                            }
                        }
                    )
                })
            }
        }
    }
    return availableCardImages
}

// isn't it nice to have a sum function?
function sum(list) {
    let result = 0
    for (let element of list) {
        result += element
    }
    return result
}

function keyPressed() {
    /* stop sketch */
    if (keyCode === 97) { /* numpad 1 */
        noLoop()
        instructions.html(`<pre>
            sketch stopped</pre>`)
        return
    }

    if (key === '`') { /* toggle debug corner visibility */
        debugCorner.visible = !debugCorner.visible
        console.log(`debugCorner visibility set to ${debugCorner.visible}`)
        return
    }

    if (key === 'z') { /* store, then show in draw(), all the cards that can
                          be cast*/
        storeAvailableCards()
        return
    }

    let redefinedKey = key.toString()
    let lowercaseKey = redefinedKey.toLowerCase()
    if (lowercaseKey === key) {
        /* remove the specified mana */
        printRemovedMana(lowercaseKey)
    } else {
        /* add the specified mana */
        printAddedMana(lowercaseKey)
    }
}

function printRemovedMana(color) {
    if (color === 'w') {
        mana[0]--
        if (mana[0] < 0) {
            print('Invalid ' + mana[0])
            mana[0] = 0
        } else {
            print('Removing White mana: White mana now at ' + mana[0])
            whiteColor.decrement()
        }
    }
    if (color === 'u') {
        mana[1]--
        if (mana[1] < 0) {
            print('Invalid ' + mana[1])
            mana[1] = 0
        } else {
            print('Removing Blue mana: Blue mana now at ' + mana[1])
            blueColor.decrement()
        }
    }
    if (color === 'b') {
        mana[2]--
        if (mana[2] < 0) {
            print('Invalid ' + mana[2])
            mana[2] = 0
        } else {
            print('Removing Black mana: Black mana now at ' + mana[2])
            blackColor.decrement()
        }
    }
    if (color === 'r') {
        mana[3]--
        if (mana[3] < 0) {
            print('Invalid ' + mana[3])
            mana[3] = 0
        } else {
            print('Removing Red mana: Red mana now at ' + mana[3])
            redColor.decrement()
        }
    }
    if (color === 'g') {
        mana[4]--
        if (mana[4] < 0) {
            print('Invalid ' + mana[4])
            mana[4] = 0
        } else {
            print('Removing Green mana: Green mana now at ' + mana[4])
            greenColor.decrement()
        }
    }
    if (color === 'c') {
        mana[5]--
        if (mana[5] < 0) {
            print('Invalid ' + mana[5])
            mana[5] = 0
        } else {
            print('Removing Colorless mana: Colorless mana now at ' + mana[5])
            colorlessColor.decrement()
        }
    }
}

function printAddedMana(color) {
    if (color === 'w') {
        if (mana[0] > 8) {
            print('Invalid ' + mana[0])
        } else {
            mana[0]++
            whiteColor.increment()
        }
    }
    if (color === 'u') {
        if (mana[1] > 8) {
            print('Invalid ' + mana[1])
        } else {
            mana[1]++
            blueColor.increment()
        }
    }
    if (color === 'b') {
        if (mana[2] > 8) {
            print('Invalid ' + mana[2])
        } else {
            mana[2]++
            blackColor.increment()
        }
    }
    if (color === 'r') {
        if (mana[3] > 8) {
            print('Invalid ' + mana[3])
        } else {
            mana[3]++
            redColor.increment()
        }
    }
    if (color === 'g') {
        if (mana[4] > 8) {
            print('Invalid ' + mana[4])
        } else {
            mana[4]++
            greenColor.increment()
        }
    }
    if (color === 'c') {
        if (mana[5] > 8) {
            print('Invalid ' + mana[5])
        } else {
            mana[5]++
            colorlessColor.increment()
        }
    }
}

function mousePressed() {
    // row of colors x requirements:
    let lowerBoundWhiteX = whiteColor.xPosition
    let upperBoundWhiteX = whiteColor.xPosition + 35
    let lowerBoundBlueX = blueColor.xPosition
    let upperBoundBlueX = blueColor.xPosition + 35
    let lowerBoundBlackX = blackColor.xPosition
    let upperBoundBlackX = blackColor.xPosition + 35
    let lowerBoundRedX = redColor.xPosition
    let upperBoundRedX = redColor.xPosition + 35
    let lowerBoundGreenX = greenColor.xPosition
    let upperBoundGreenX = greenColor.xPosition + 35
    let lowerBoundColorlessX = colorlessColor.xPosition
    let upperBoundColorlessX = colorlessColor.xPosition + 35

    // is it even in the row of colors?
    if (50 < mouseY && mouseY < 100) {
        // white
        if (lowerBoundWhiteX < mouseX && mouseX < upperBoundWhiteX) {
            printAddedMana('w')
        }
        // blue
        if (lowerBoundBlueX < mouseX && mouseX < upperBoundBlueX) {
            printAddedMana('u')
        }
        // black
        if (lowerBoundBlackX < mouseX && mouseX < upperBoundBlackX) {
            printAddedMana('b')
        }
        // red
        if (lowerBoundRedX < mouseX && mouseX < upperBoundRedX) {
            printAddedMana('r')
        }
        // green
        if (lowerBoundGreenX < mouseX && mouseX < upperBoundGreenX) {
            printAddedMana('g')
        }
        // colorless
        if (lowerBoundColorlessX < mouseX && mouseX < upperBoundColorlessX) {
            printAddedMana('c')
        }
    }

    // rarities!
    if (50 < mouseY && mouseY < 100) {
        if (375 < mouseX && mouseX < 410) {
            raritiesSelected['common'] = !raritiesSelected['common']
        } if (420 < mouseX && mouseX < 455) {
            raritiesSelected['uncommon'] = !raritiesSelected['uncommon']
        } if (465 < mouseX && mouseX < 500) {
            raritiesSelected['rare'] = !raritiesSelected['rare']
        } if (510 < mouseX && mouseX < 545) {
            raritiesSelected['mythic'] = !raritiesSelected['mythic']
        }
    }
}

/** 🧹 shows debugging info using text() 🧹 */
class CanvasDebugCorner {
    constructor(lines) {
        this.visible = true
        this.size = lines
        this.debugMsgList = [] /* initialize all elements to empty string */
        for (let i in lines)
            this.debugMsgList[i] = ''
    }

    setText(text, index) {
        if (index >= this.size) {
            this.debugMsgList[0] = `${index} ← index>${this.size} not supported`
        } else this.debugMsgList[index] = text
    }

    showBottom() {
        if (this.visible) {
            noStroke()
            textFont(fixedWidthFont, 14)

            const LEFT_MARGIN = 10
            const DEBUG_Y_OFFSET = height - 10 /* floor of debug corner */
            const LINE_SPACING = 2
            const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING

            /* semi-transparent background */
            fill(0, 0, 0, 10)
            rectMode(CORNERS)
            const TOP_PADDING = 3 /* extra padding on top of the 1st line */
            rect(
                0,
                height,
                width,
                DEBUG_Y_OFFSET - LINE_HEIGHT * this.debugMsgList.length - TOP_PADDING
            )

            fill(0, 0, 100, 100) /* white */
            strokeWeight(0)

            for (let index in this.debugMsgList) {
                const msg = this.debugMsgList[index]
                text(msg, LEFT_MARGIN, DEBUG_Y_OFFSET - LINE_HEIGHT * index)
            }
        }
    }

    showTop() {
        if (this.visible) {
            noStroke()
            textFont(fixedWidthFont, 14)

            const LEFT_MARGIN = 10
            const TOP_PADDING = 3 /* extra padding on top of the 1st line */

            /* offset from top of canvas */
            const DEBUG_Y_OFFSET = textAscent() + TOP_PADDING
            const LINE_SPACING = 2
            const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING

            /* semi-transparent background, a console-like feel */
            fill(0, 0, 0, 10)
            rectMode(CORNERS)

            rect( /* x, y, w, h */
                0,
                0,
                width,
                DEBUG_Y_OFFSET + LINE_HEIGHT*this.debugMsgList.length/*-TOP_PADDING*/
            )

            fill(0, 0, 100, 100) /* white */
            strokeWeight(0)

            textAlign(LEFT)
            for (let i in this.debugMsgList) {
                const msg = this.debugMsgList[i]
                text(msg, LEFT_MARGIN, LINE_HEIGHT*i + DEBUG_Y_OFFSET)
            }
        }
    }
}

/** defines a color and displays it using image() and svg files */
class Color {
    /* Argument definition:
     * colorName → The prefix letter of the color
     * colorSymbol → The SVG file that is displayed when draw() is called
     * color → the color of the symbol that will be filled/tinted on draw()
     * x/y → defines the position of the image when drawn on draw() */
    constructor(colorName, colorSymbol, color, x, y) {
        this.color = color
        this.colorName = colorName
        this.colorSVGFile = colorSymbol
        this.xPosition = x
        this.yPosition = y
        /* the number of times the color has been selected */
        this.numSelected = 0
    }

    /* Argument definition:
     * NONE
     * Function definition:
     * Draws this.SVG file on the screen and displays a little rectangle
     * surrounding it */
    draw() {
        stroke(this.color[0], this.color[1], this.color[2])
        noFill()
        strokeWeight(2)
        rect(this.xPosition-3, this.yPosition-3, this.xPosition+38, this.yPosition+38)

        tint(this.color[0], this.color[1], this.color[2])
        image(this.colorSVGFile, this.xPosition, this.yPosition, 35, 35)

        noStroke()
        fill(this.color[0], this.color[1], this.color[2])
        for (let i = 0; i < this.numSelected; i++) {
            rect(this.xPosition-3, this.yPosition + 50 + i*10, this.xPosition+38, this.yPosition+45 + i*10, 2)
        }
    }

    /* Nothing to describe */
    increment() {
        this.numSelected++
    }

    /* Nothing to describe */
    decrement() {
        this.numSelected--
    }
}

/** defines a trick and displays it using image() */
class Trick {
    /*
    Constructor
        Definition: Initializes all variables.
        Argument definition:
        image → The image of the card.
        widthOfImage → The width of the resized image.
        xPos → the current x position of the card.
        yPos → the current y position of the card.
     */
    constructor(image, xPos, yPos, widthOfImage, hoverImage) {
        this.image = image
        this.image.resize(widthOfImage, 0)
        this.hoverImage = hoverImage
        this.hoverImage.resize(widthOfImage*3, 0)
        this.xPos = xPos
        this.yPos = yPos
        this.show = true
        this.hovered = false
    }

    /*
     * Definition: Changes the position to something different
     * Argument definition:
     * x → The x position of the new location
     * y → The y position of the new location
     * */
    changePos(x, y) {
        this.xPos = x
        this.yPos = y
    }

    /*
     * Definition: Sets the card to show or hide
     * Argument definition:
     * showOrHide → Tells the trick whether to show or hide:
     *     True → Tells the trick to show
     *     False → Tells the trick to hide
     */
    setShow(showOrHide) {
        this.show = showOrHide
    }

    /*
     * Definition: Draws the card at this.xPos and this.yPos if this.show is
     *             true. Use setShow() to set whether the card should show
     *             or hide and use changePos() to change the position. A
     *             larger image is displayed on top of the cursor if
     *             this.hovered is on.
     * Argument definition:
     * None
     */
    draw() {
        if (this.show) {
            image(this.image, this.xPos, this.yPos)
        }
    }

    /*
     * Definition: Draws this.hoverImage centered at mouseX, mouseY.
     * Argument definition:
     * None
     */
    drawBigImage() {
        if (this.hovered) {
            image(this.hoverImage, width/2-this.hoverImage.width/2, windowHeight/4+window.scrollY-this.hoverImage.height/2)
        }
    }

    /*
     * Definition: Sets this.hovered to True if this card is hovered. It also
     *             sets hoveringOverImage to True under the same conditions as
     *             it is set to False at the beginning of each draw frame.
     * Argument definition:
     * None
     */
    checkIsHovered() {
        // the hover image is bounded by some very hard-to-calculate
        // coordinates.

        let hoveringOverHoverImage = false

        if (hoveringOverImage ||
            (mouseX < this.xPos || // goes left of the left bound
            mouseX > this.xPos + this.image.width || // goes right of the right bound
            mouseY < this.yPos || // goes higher than the top bound
            mouseY > this.yPos + this.image.height) // goes lower than the bottom bound
        ){
            if (mouseX < width/2-this.hoverImage.width/2 ||
                mouseX > width/2+this.hoverImage.width/2 ||
                mouseY < windowHeight/4+window.scrollY-this.hoverImage.height/2 ||
                mouseY > windowHeight/4+window.scrollY+this.hoverImage.height/2) {
            } else {
                hoveringOverHoverImage = true
            }
        }

        if (!hoveringOverHoverImage) {
            if (mouseX < this.xPos || // goes left of the left bound
                mouseX > this.xPos + this.image.width || // goes right of the right bound
                mouseY < this.yPos || // goes higher than the top bound
                mouseY > this.yPos + this.image.height) { // goes lower than the bottom bound
                this.hovered = false
                return
            }

            this.hovered = true
            hoveringOverImage = true
        } else {
            if (this.hovered === true) {
                hoveringOverImage = true
            }
        }
    }
}
