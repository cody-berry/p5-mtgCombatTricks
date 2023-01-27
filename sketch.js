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
let url='https://api.scryfall.com/cards/search?q=set:bro'
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


function preload() {
    font = loadFont('data/consola.ttf')
    fixedWidthFont = loadFont('data/consola.ttf')
    variableWidthFont = loadFont('data/meiryo.ttf')
    loadJSON(url, printAndPaginateData)
    // retro artifacts might be useful later.
    loadJSON('https://api.scryfall.com/cards/search?q=set:brr', printAndPaginateData)

    // iterate through all the mana symbols
    whiteIcon = loadImage('svg/w.svg')
    blueIcon = loadImage('svg/u.svg')
    blackIcon = loadImage('svg/b.svg')
    redIcon = loadImage('svg/r.svg')
    greenIcon = loadImage('svg/g.svg')
    colorlessIcon = loadImage('svg/c.svg')
    phyrexianIcon = loadImage('svg/p.svg')
}

// paganates the data if necessary
function printAndPaginateData(data) {
    let currentCards = data['data']
    // add the data to the json
    cards = [ ...cards, ...currentCards] /* spread operator: ... */

    if (data['has_more']) {
        loadJSON(data['next_page'], printAndPaginateData)
    }
}

function setup() {
    let cnv = createCanvas(600, 300)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
        numpad 1 → freeze sketch
        W/U/B/R/G/C/A → Add 1 White/Blue/Black/Red/Green/Colorless/All mana
        w/u/b/r/g/c/a → Remove 1 White/Blue/Black/Red/Green/Colorless/All mana
        z → Print all available combat tricks</pre>`)

    cards = filterInstantsAndFlashCards(cards)
    print(cards)

    whiteColor = new Color('White', whiteIcon, [59, 25, 95], 50, 50)
    blueColor = new Color('Blue', blueIcon, [192, 40, 93], 120, 50)
    blackColor = new Color('Black', blackIcon, [0, 3, 47], 190, 50)
    redColor = new Color('Red', redIcon, [5, 70, 84], 260, 50)
    greenColor = new Color('Green', greenIcon, [155, 95, 71], 330, 50)
    colorlessColor = new Color('Colorless', colorlessIcon, [240, 2, 87], 400, 50)

    debugCorner = new CanvasDebugCorner(5)
}

function filterInstantsAndFlashCards(cards) {
    let resultingCardList = []
    for (let card of cards) {
        if (card['type_line'] === 'Instant') {
            resultingCardList.push(card)
        }
        if (card['keywords'].includes('Flash')) {
            resultingCardList.push(card)
        }
    }
    return resultingCardList
}

function draw() {
    background(234, 34, 24)

    /* debugCorner needs to be last so its z-index is highest */
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.showBottom()

    whiteColor.draw()
    blueColor.draw()
    blackColor.draw()
    redColor.draw()
    greenColor.draw()
    colorlessColor.draw()

    if (frameCount > 30000)
        noLoop()
}

// Who knows what you can or cannot cast without a function?
function printAvailableCards() {
    for (let card of cards) {
        let cardCMC = card['cmc']
        if (cardCMC > sum(mana)) {
        } else {
            let cardCost = card['mana_cost']
            let manaMinusUsed = {
                'W': mana[0],
                'U': mana[1],
                'B': mana[2],
                'R': mana[3],
                'G': mana[4]
            }
            let cannotCastCard = false
            for (let char of cardCost) {
                if (!['X', '1', '2', '3',
                      '4', '5', '6', '7',
                      '8', '9', '{', '}']
                      .includes(char) && !cannotCastCard) {
                    manaMinusUsed[char] -= 1
                    if (manaMinusUsed[char] < 0) {
                        cannotCastCard = true
                    }
                }
            }
            if (!cannotCastCard) {
                if (card['flavor_text']) {
                    print(card['name'] + "\n" + "\n" + card['type_line'] + "\n" +
                          card['oracle_text'] + "\n\n" + card['flavor_text'])
                } else {
                    print(card['name'] + "\n" + card['type_line'] + "\n" +
                          card['oracle_text'])
                }
            }
        }
    }
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
            sketch stopped
            ⚠Cannot be resumed⚠
            ❗Please reload❗</pre>`)
        return
    }

    if (key === '`') { /* toggle debug corner visibility */
        debugCorner.visible = !debugCorner.visible
        console.log(`debugCorner visibility set to ${debugCorner.visible}`)
        return
    }

    if (key === 'z') {
        printAvailableCards()
        return
    }

    redefinedKey = key.toString()
    lowercaseKey = redefinedKey.toLowerCase()
    if (lowercaseKey === key) {
        printRemovedMana(lowercaseKey)
    } else {
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
        }
    }
    if (color === 'u') {
        mana[1]--
        if (mana[1] < 0) {
            print('Invalid ' + mana[1])
            mana[1] = 0
        } else {
            print('Removing Blue mana: Blue mana now at ' + mana[1])
        }
    }
    if (color === 'b') {
        mana[2]--
        if (mana[2] < 0) {
            print('Invalid ' + mana[2])
            mana[2] = 0
        } else {
            print('Removing Black mana: Black mana now at ' + mana[2])
        }
    }
    if (color === 'r') {
        mana[3]--
        if (mana[3] < 0) {
            print('Invalid ' + mana[3])
            mana[3] = 0
        } else {
            print('Removing Red mana: Red mana now at ' + mana[3])
        }
    }
    if (color === 'g') {
        mana[4]--
        if (mana[4] < 0) {
            print('Invalid ' + mana[4])
            mana[4] = 0
        } else {
            print('Removing Green mana: Green mana now at ' + mana[4])
        }
    }
    if (color === 'c') {
        mana[5]--
        if (mana[5] < 0) {
            print('Invalid ' + mana[5])
            mana[5] = 0
        } else {
            print('Removing Colorless mana: Colorless mana now at ' + mana[5])
        }
    }
    if (color === 'a') {
        let i = 0
        for (let value of mana) {
            if (value > 0) {
                mana[i]--
            } else {
                print('Invalid ' + mana[i] + ' ' + i)
            }
            i++
        }
        print('Removing 1 from all mana')
    }
}

function printAddedMana(color) {
    if (color === 'w') {
        mana[0]++
        print('Adding White mana: White mana now at ' + mana[0])
    }
    if (color === 'u') {
        mana[1]++
        print('Adding Blue mana: Blue mana now at ' + mana[1])
    }
    if (color === 'b') {
        mana[2]++
        print('Adding Black mana: Black mana now at ' + mana[2])
    }
    if (color === 'r') {
        mana[3]++
        print('Adding Red mana: Red mana now at ' + mana[3])
    }
    if (color === 'g') {
        mana[4]++
        print('Adding Green mana: Green mana now at ' + mana[4])
    }
    if (color === 'c') {
        mana[5]++
        print('Adding Colorless mana: Colorless mana now at ' + mana[5])
    }
    if (color === 'a') {
        let i = 0
        for (let value of mana) {
            mana[i]++
        }
        print('Adding 1 to all mana')
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
        this.colorPrefixName = colorName
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
        rect(this.xPosition-3, this.yPosition-3, this.xPosition+53, this.yPosition+53)
        tint(this.color[0], this.color[1], this.color[2])
        image(this.colorSVGFile, this.xPosition, this.yPosition, 50, 50)
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
