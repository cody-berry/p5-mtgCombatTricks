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
let url='https://api.scryfall.com/cards/search?q=set:mkm'
let cards=[] /* data for the cards */
let mana = [0,0,0,0,0,0,0] /* mana in WUBRG order, then colorless and multicolored mana */
let whiteIcon
let blueIcon
let blackIcon
let redIcon
let greenIcon
let colorlessIcon
let phyrexianIcon
let goldIcon
let whiteColor
let blueColor
let blackColor
let redColor
let greenColor
let colorlessColor
let goldColor
let availableCardImages = {} // what cards can we cast?
let raritiesSelected = { // the rarites that have been selected
    'common': true,
    'uncommon': true,
    'rare': true,
    'mythic': true
}
let cnv
let rowsPrevious = 0
let cardCMCsPrevious = 0
let hoveringOverImage = false
let azorius
let dimir
let rakdos
let gruul
let selesnya
let orzhov
let izzet
let golgari
let boros
let simic

// where are all the colors?
let colors = {"W": [59, 25, 95],
    "U": [192, 40, 93],
    "B": [0, 3, 47],
    "R": [5, 80, 84],
    "G": [155, 95, 71],
    "C": [240, 5, 87],
    "M": [41, 40, 100]}

function preload() {
    font = loadFont('data/consola.ttf')
    fixedWidthFont = loadFont('data/consola.ttf')
    variableWidthFont = loadFont('data/meiryo.ttf')

    loadJSON(url, printAndPaginateData)
    // loadJSON('https://api.scryfall.com/cards/search?q=set:wot', printAndPaginateData)

    // iterate through all the mana symbols and load them
    whiteIcon = loadImage('svg/w.svg')
    blueIcon = loadImage('svg/u.svg')
    blackIcon = loadImage('svg/b.svg')
    redIcon = loadImage('svg/r.svg')
    greenIcon = loadImage('svg/g.svg')
    colorlessIcon = loadImage('svg/c.svg')
    phyrexianIcon = loadImage('svg/p.svg')
    goldIcon = loadImage('svg/M.svg')
}

// paginates the data if necessary, then filters the instants and flash cards
function printAndPaginateData(data) {
    let currentCards = data['data']

    currentCards = filterInstantsAndFlashCards(currentCards)

    // add the data to the json
    cards = [ ...cards, ...currentCards] /* spread operator: ... */

    if (data['has_more']) {
        loadJSON(data['next_page'], printAndPaginateData)
    }
}

function setup() {
    cnv = createCanvas(700, 2600)
    cnv.parent('#canvas')

    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)


    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
        numpad 1 → freeze sketch
        W, U, B, R, G, C, or click on symbol → Add 1 mana
        w, u, b, r, g, or c → Remove 1 White/Blue/Black/Red/Green/Colorless mana
        z → Display all available combat tricks
        
        Hover over a card to display the trick in the middle of the screen.
        The hovered combat trick cannot change while you are hovering over the 
        image displayed in the middle of the screen.
        If you click on the hovered combat trick or the image in the middle of 
        the screen, the card data will appear in Console in DevTools.
        
        Please do not reduce width below the canvas width
        <b>⚠ Do NOT press 'z' multiple times within a short time ⚠</b>
        </b></pre>`)


    // create all the Color functions
    whiteColor = new SingleColor('White', whiteIcon, colors.W, 50, 50)
    blueColor = new SingleColor('Blue', blueIcon, colors.U, 100, 50)
    blackColor = new SingleColor('Black', blackIcon, colors.B, 150, 50)
    redColor = new SingleColor('Red', redIcon, colors.R, 200, 50)
    greenColor = new SingleColor('Green', greenIcon, colors.G, 250, 50)
    colorlessColor = new SingleColor('Colorless', colorlessIcon, colors.C, 300, 50)
    goldColor = new SingleColor('Gold', goldIcon, colors.M, 350, 50)
    azorius = new DoubleColor(
        'Azorius', whiteIcon, blueIcon, colors.W, colors.U, 50, 200)
    dimir = new DoubleColor(
        'Dimir', blueIcon, blackIcon, colors.U, colors.B, 100, 200)
    rakdos = new DoubleColor(
        'Rakdos', blackIcon, redIcon, colors.B, colors.R, 150, 200)
    gruul = new DoubleColor(
        'Gruul', redIcon, greenIcon, colors.R, colors.G, 200, 200)
    selesnya = new DoubleColor(
        'Selesnya', greenIcon, whiteIcon, colors.G, colors.W, 250, 200)
    orzhov = new DoubleColor(
        'Orzhov', whiteIcon, blackIcon, colors.W, colors.B, 300, 200)
    izzet = new DoubleColor(
        'Izzet', blueIcon, redIcon, colors.U, colors.R, 350, 200)
    golgari = new DoubleColor(
        'Golgari', blackIcon, greenIcon, colors.B, colors.G, 400, 200)
    boros = new DoubleColor(
        'Boros', redIcon, whiteIcon, colors.R, colors.W, 450, 200)
    simic = new DoubleColor(
        'Simic', greenIcon, blueIcon, colors.G, colors.U, 500, 200)

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
    let wallpapers = ["MKM/candlestick.jpg", "MKM/knife.jpg",
                      "MKM/leadpipe.jpg", "MKM/rope.jpg", "MKM/wrench.jpg"]
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
    let manaCosts = [
        "{U/G}{2/U}",
        "{2/U}{U/R}{2/R}",
        "{R/G}",
        ""
    ]
    print("Tests:")
    for (let manaCost of manaCosts) {
        print(manaCost)
    }
    print("")
    print("Outputs:")
    for (let manaCost of manaCosts) {
        print(findPossibleManaCostCombinations(manaCost))
    }
    print("")
    print("Expected outputs:")
    print(["{U}{2}", "{G}{2}", "{U}{U}", "{G}{U}"])
    print(["{2}{U}{2}", "{U}{U}{2}", "{2}{R}{2}", "{U}{R}{2}",
           "{2}{U}{R}", "{U}{U}{R}", "{2}{R}{R}", "{U}{R}{R}"])
    print(["{R}", "{G}"])
    print([""])
    print("")
    print("Rearranged outputs:")
    print(["{2}{U}", "{2}{G}", "{U}{U}", "{U}{G}"])
    print(["{4}{U}", "{2}{U}{U}", "{4}{R}", "{2}{U}{R}",
        "{2}{U}{R}", "{U}{U}{R}", "{2}{R}{R}", "{U}{R}{R}"])
    print(["{R}", "{G}"])
    print([""])
}

function filterInstantsAndFlashCards(cards) {
    // instants and flash cards
    let resultingCardList = []
    for (let card of cards) {
        if (card["card_faces"]) {
            for (let cardFace of card["card_faces"]) {
                // type_line is the type of the card. If it is an Instant, then
                // it is a combat trick.
                if (cardFace['type_line'].includes('Instant')) {
                    cardFace["image_uris"] = card["image_uris"]
                    cardFace["rarity"] = card["rarity"]
                    cardFace["cmc"] = calculateCMC(cardFace["mana_cost"])
                    resultingCardList.push(cardFace)
                }
                // it may also be a combat trick if the oracle text includes
                // Flash. For example, in BRO, Zephyr Sentinel or Ambush
                // Paratrooper.
                if (cardFace['oracle_text'].includes('Flash') ||
                    cardFace['oracle_text'].includes('flash')) {
                    cardFace["image_uris"] = card["image_uris"]
                    cardFace["rarity"] = card["rarity"]
                    cardFace["cmc"] = calculateCMC(cardFace["mana_cost"])
                    resultingCardList.push(cardFace)
                }
            }
        } else {
            if (card['object'] !== 'card_face') {
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
                // if the opponent has a face down morph/disguise creature, it
                // each disguise creature is a combat trick.
                if (card['keywords'].includes('Disguise')) {
                    resultingCardList.push(card)
                }
            }
        }
    }
    return resultingCardList
}

// calculates the cmc based on a mana cost
function calculateCMC(manaCost) {
    let cmc = 0
    let currentNumber = 0
    for (let i = 0; i < manaCost.length; i++) {
        let char = manaCost[i]
        if (char === "}") {
            cmc += currentNumber
            currentNumber = 0
        } else if (!isNaN(parseInt(char))) {
            currentNumber = currentNumber*10 + parseInt(char)
        } else if (["W", "U", "B", "R", "G"].includes(char)) {
            cmc++
        } else if (char === "/") {
            cmc--
        }
    }
    return cmc
}

function draw() {
    clear()

    // how wide is a column, and how high is a row?
    let colWidth = 125
    let rowHeight = 172

    // the space between card CMCs and the number of the spaces between card
    // CMCs we have. otherwise a card will eventually overlap with the
    // spacing between.
    let cardCMCs = 0
    let cardCMCSpacingHeight = 17

    resizeCanvas(700, 435+rowsPrevious*rowHeight + cardCMCsPrevious*cardCMCSpacingHeight)

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
    goldColor.draw()
    colorlessColor.draw()
    azorius.draw()
    dimir.draw()
    rakdos.draw()
    gruul.draw()
    selesnya.draw()
    orzhov.draw()
    izzet.draw()
    golgari.draw()
    boros.draw()
    simic.draw()


    // formatting: displaying that the next part is cards able to be cast
    textSize(14)
    text('Cards able to be cast (press \'z\' to update)', 4, 325)
    noStroke()
    fill(237, 37, 20, 50)
    rect(0, 329, 700, 333)

    // used to define the position of the next card
    let col = 0
    let row = 0

    trickHovered = null

    // iterate through all the card CMCs
    for (let cardCMC in availableCardImages) {
        // mana symbol: circle + CMC
        fill(50)
        ellipse(40, 360 + row*rowHeight + cardCMCs*cardCMCSpacingHeight, 30)
        fill(100)
        stroke(100)
        textAlign(CENTER)
        text(cardCMC, 40, 365 + row*rowHeight + cardCMCs*cardCMCSpacingHeight)
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
            card.changePos(-50 + col*colWidth, 340+(row)*rowHeight + cardCMCs*cardCMCSpacingHeight)

            // make sure all the tricks are showed
            card.setShow(true)

            // check if it is hovered
            card.draw()
        }
        row++
        cardCMCs++

        noStroke()
        fill(237, 37, 20, 50)
        rect(-10, 325+row*rowHeight + cardCMCs*cardCMCSpacingHeight, 800, 335+row*rowHeight + cardCMCs*cardCMCSpacingHeight)
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

    rowsPrevious = row
    cardCMCsPrevious = cardCMCs

    textAlign(LEFT)

    /* debugCorner needs to be last so its z-index is highest */
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.showBottom()
}

// return a list of possible mana available according to the amount of hybrid mana.
// Warning: This doesn't include the original mana.
function findPossibleManaAvailableCombinations() {
    // let's start by making shorter references to the hybrid mana selected.
    let azoriusNum = azorius.numSelected
    let dimirNum = dimir.numSelected
    let rakdosNum = rakdos.numSelected
    let gruulNum = gruul.numSelected
    let selesnyaNum = selesnya.numSelected
    let orzhovNum = orzhov.numSelected
    let izzetNum = izzet.numSelected
    let golgariNum = golgari.numSelected
    let borosNum = boros.numSelected
    let simicNum = simic.numSelected

    let numHybridMana = sum(
        [azoriusNum, dimirNum, rakdosNum, gruulNum, selesnyaNum,
         orzhovNum, izzetNum, golgariNum, borosNum, simicNum])

    // we do the same thing as in findPossibleManaCostCombinations: add a
    // binary number representing each hybrid mana
    let possibilityNumBinary = []
    for (let i = 0; i < numHybridMana; i++) {
        possibilityNumBinary.push(0)
    }

    let possibilities = []
    for (let i = 0; i < 2**numHybridMana; i++) {
        let possibility = {
            "W": 0,
            "U": 0,
            "B": 0,
            "R": 0,
            "G": 0
        }
        let hybridManaNum = 0

        // now we just iterate through each color pair
        for (let i = 0; i < azoriusNum; i++) {
            if (possibilityNumBinary[hybridManaNum] === 0) possibility["W"]++
            else possibility["U"]++
            hybridManaNum++
        } for (let i = 0; i < dimirNum; i++) {
            if (possibilityNumBinary[hybridManaNum] === 0) possibility["U"]++
            else possibility["B"]++
            hybridManaNum++
        } for (let i = 0; i < rakdosNum; i++) {
            if (possibilityNumBinary[hybridManaNum] === 0) possibility["B"]++
            else possibility["R"]++
            hybridManaNum++
        } for (let i = 0; i < gruulNum; i++) {
            if (possibilityNumBinary[hybridManaNum] === 0) possibility["R"]++
            else possibility["G"]++
            hybridManaNum++
        } for (let i = 0; i < selesnyaNum; i++) {
            if (possibilityNumBinary[hybridManaNum] === 0) possibility["G"]++
            else possibility["W"]++
            hybridManaNum++
        } for (let i = 0; i < orzhovNum; i++) {
            if (possibilityNumBinary[hybridManaNum] === 0) possibility["W"]++
            else possibility["B"]++
            hybridManaNum++
        } for (let i = 0; i < izzetNum; i++) {
            if (possibilityNumBinary[hybridManaNum] === 0) possibility["U"]++
            else possibility["R"]++
            hybridManaNum++
        } for (let i = 0; i < golgariNum; i++) {
            if (possibilityNumBinary[hybridManaNum] === 0) possibility["B"]++
            else possibility["G"]++
            hybridManaNum++
        } for (let i = 0; i < borosNum; i++) {
            if (possibilityNumBinary[hybridManaNum] === 0) possibility["R"]++
            else possibility["W"]++
            hybridManaNum++
        } for (let i = 0; i < simicNum; i++) {
            if (possibilityNumBinary[hybridManaNum] === 0) possibility["G"]++
            else possibility["U"]++
            hybridManaNum++
        }

        // update the binary number
        let carry = false
        if (possibilityNumBinary[0] === 1) {
            carry = true
            possibilityNumBinary[0] = 0
        } else {
            possibilityNumBinary[0] = 1
        }
        for (let i = 1; i < possibilityNumBinary.length && carry; i++) {
            if (possibilityNumBinary[i] === 1) {
                carry = true
                possibilityNumBinary[i] = 0
            } else {
                carry = false
                possibilityNumBinary[i] = 1
            }
        }

        possibilities.push(possibility)
    }
    return possibilities
}

// return a list of possible mana costs for a hybrid mana cost
function findPossibleManaCostCombinations(hybridManaCost) {
    let nonHybridManaSymbol = ""
    let hybridManaSymbols = []
    let manaSymbols = hybridManaCost.split("{") // split at the beginning of each mana symbol
    for (let manaSymbol of manaSymbols) {
        if (manaSymbol !== "") { // the first mana symbol is "" because at the beginning there's a "{".
            manaSymbol = "{" + manaSymbol
            if (manaSymbol.includes("/")) {
                hybridManaSymbols.push(manaSymbol)
            } else {
                nonHybridManaSymbol += manaSymbol
            }
        }
    }

    // what if there is no hybrid mana symbols?
    if (hybridManaSymbols.length === 0) {
        return [nonHybridManaSymbol]
    } else {
        // there should be 2**hybridManaSymbols.length possibilities. We can
        // represent each of these possibilities by using a binary number, each
        // digit corresponding to which of the two mana symbols to use
        let possibilityNumBinary = []
        for (let numCostsSoFar in hybridManaSymbols) { // just push one for
            possibilityNumBinary.push(0)
        }

        let possibilities = []
        for (let possibilityNum = 0; possibilityNum < 2 ** possibilityNumBinary.length;
             possibilityNum++) { // iterate through every possibility
            let possibility = nonHybridManaSymbol
            for (let i = 0; i < hybridManaSymbols.length; i++) { // iterate through every hybrid mana cost piece
                let hybridManaSymbol = hybridManaSymbols[i]
                let twoSidesOfHybridManaCost = hybridManaSymbol.split("/")
                if (possibilityNumBinary[i] === 0) {
                    possibility += twoSidesOfHybridManaCost[0] + "}"
                } else {
                    possibility += "{" + twoSidesOfHybridManaCost[1]
                }
            }
            possibilities.push(possibility)

            // update the binary number
            let carry = false
            if (possibilityNumBinary[0] === 1) {
                carry = true
                possibilityNumBinary[0] = 0
            } else {
                possibilityNumBinary[0] = 1
            }
            for (let i = 1; i < possibilityNumBinary.length && carry; i++) {
                if (possibilityNumBinary[i] === 1) {
                    carry = true
                    possibilityNumBinary[i] = 0
                } else {
                    carry = false
                    possibilityNumBinary[i] = 1
                }
            }
        }
        return possibilities
    }
}

// Who knows what you can or cannot cast without a function?
function storeAvailableCards() {
    availableCardImages = {} // the available cards in a dictionary with keys
                             // of cmc's and values of a list of card images
    let hybridManaPossibilities = findPossibleManaAvailableCombinations()

    // find out the amount of mana availablee
    let azoriusNum = azorius.numSelected
    let dimirNum = dimir.numSelected
    let rakdosNum = rakdos.numSelected
    let gruulNum = gruul.numSelected
    let selesnyaNum = selesnya.numSelected
    let orzhovNum = orzhov.numSelected
    let izzetNum = izzet.numSelected
    let golgariNum = golgari.numSelected
    let borosNum = boros.numSelected
    let simicNum = simic.numSelected

    let manaAvailable = sum(
        [azoriusNum, dimirNum, rakdosNum, gruulNum, selesnyaNum,
            orzhovNum, izzetNum, golgariNum, borosNum, simicNum]) + sum(mana)

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
                    if (char !== 'X' && char !== '{' && char !== '}') {
                        genericManaOmitted = char*1
                        break
                    }
                }
            }
        }

        if (cardCMC - genericManaOmitted > manaAvailable) {
            if (card["oracle_text"].indexOf("Convoke") === -1) {
                continue
            }
        } if (/* the rarity could
         sometimes not be
         selected!*/ !raritiesSelected[card['rarity']]) {
        } else {
            let cardCost = card['mana_cost']

            let canCastCard = false
            for (let cost of findPossibleManaCostCombinations(cardCost)) {
                for (let hybridLandRepresentation of hybridManaPossibilities) {
                    let manaMinusUsed = {
                        'W': mana[0] + hybridLandRepresentation["W"], // mana[0] = white mana
                        'U': mana[1] + hybridLandRepresentation["U"], // mana[1] = blue mana
                        'B': mana[2] + hybridLandRepresentation["B"], // mana[2] = black mana
                        'R': mana[3] + hybridLandRepresentation["R"], // mana[3] = red mana
                        'G': mana[4] + hybridLandRepresentation["G"], // mana[4] = green mana
                        'M': mana[6]  // mana[6] = gold mana
                    } // colorless mana is not included because we ignore numbers
                    for (let char of cost) {
                        if (['W', 'U', 'B', 'R', 'G'] // characters to be selected
                            .includes(char)) {
                            manaMinusUsed[char] -= 1 // char's gonna be W, U, B, R, or G
                            if (manaMinusUsed[char] < 0) {
                                manaMinusUsed[char] = 0
                                manaMinusUsed["M"] -= 1
                            }
                        }
                    }
                    let canDoThisPossibility = true
                    for (let manaAmount in manaMinusUsed) { // warning: this starts out as the color
                        manaAmount = manaMinusUsed[manaAmount]
                        if (manaAmount < 0) {
                            canDoThisPossibility = false
                        }
                    }
                    if (canDoThisPossibility) {
                        canCastCard = true
                    }
                }
            }
            if (canCastCard) {
                loadImage(card['image_uris']['png'],
                    data => {
                        loadImage(card['image_uris']['png'], data2 => {
                            // the Trick for displaying
                            let newTrick = new Trick(data, 0, 0, 120, data2, card)
                            newTrick.setShow(false)


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
        removeMana(lowercaseKey)
    } else {
        /* add the specified mana */
        addMana(lowercaseKey)
    }
}

function removeMana(color) {
    if (color === 'w') {
        mana[0]--
        if (mana[0] < 0) {
            mana[0] = 0
        } else {
            whiteColor.decrement()
        }
    }
    if (color === 'u') {
        mana[1]--
        if (mana[1] < 0) {
            mana[1] = 0
        } else {
            blueColor.decrement()
        }
    }
    if (color === 'b') {
        mana[2]--
        if (mana[2] < 0) {
            mana[2] = 0
        } else {
            blackColor.decrement()
        }
    }
    if (color === 'r') {
        mana[3]--
        if (mana[3] < 0) {
            mana[3] = 0
        } else {
            redColor.decrement()
        }
    }
    if (color === 'g') {
        mana[4]--
        if (mana[4] < 0) {
            mana[4] = 0
        } else {
            greenColor.decrement()
        }
    }
    if (color === 'c') {
        mana[5]--
        if (mana[5] < 0) {
            mana[5] = 0
        } else {
            colorlessColor.decrement()
        }
    }
    if (color === 'm') {
        mana[6]--
        if (mana[6] < 0) {
            mana[6] = 0
        } else {
            goldColor.decrement()
        }
    }
}

function addMana(color) {
    if (color === 'w') {
        if (mana[0] > 8) {
        } else {
            mana[0]++
            whiteColor.increment()
        }
    }
    if (color === 'u') {
        if (mana[1] > 8) {
        } else {
            mana[1]++
            blueColor.increment()
        }
    }
    if (color === 'b') {
        if (mana[2] > 8) {
        } else {
            mana[2]++
            blackColor.increment()
        }
    }
    if (color === 'r') {
        if (mana[3] > 8) {
        } else {
            mana[3]++
            redColor.increment()
        }
    }
    if (color === 'g') {
        if (mana[4] > 8) {
        } else {
            mana[4]++
            greenColor.increment()
        }
    }
    if (color === 'c') {
        if (mana[5] > 8) {
        } else {
            mana[5]++
            colorlessColor.increment()
        }
    }
    if (color === 'm') {
        if (mana[6] > 8) {
        } else {
            mana[6]++
            goldColor.increment()
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
    let lowerBoundGoldX = goldColor.xPosition
    let upperBoundGoldX = goldColor.xPosition + 35


    let lowerBoundAzoriusX = azorius.xPosition
    let upperBoundAzoriusX = azorius.xPosition + 11
    let lowerBoundDimirX = dimir.xPosition
    let upperBoundDimirX = dimir.xPosition + 11
    let lowerBoundRakdosX = rakdos.xPosition
    let upperBoundRakdosX = rakdos.xPosition + 11
    let lowerBoundGruulX = gruul.xPosition
    let upperBoundGruulX = gruul.xPosition + 11
    let lowerBoundSelesnyaX = selesnya.xPosition
    let upperBoundSelesnyaX = selesnya.xPosition + 11
    let lowerBoundOrzhovX = orzhov.xPosition
    let upperBoundOrzhovX = orzhov.xPosition + 11
    let lowerBoundIzzetX = izzet.xPosition
    let upperBoundIzzetX = izzet.xPosition + 11
    let lowerBoundGolgariX = golgari.xPosition
    let upperBoundGolgariX = golgari.xPosition + 11
    let lowerBoundBorosX = boros.xPosition
    let upperBoundBorosX = boros.xPosition + 11
    let lowerBoundSimicX = simic.xPosition
    let upperBoundSimicX = simic.xPosition + 11

    // check if it's in one of the rows of colors
    if (50 < mouseY && mouseY < 85) { // single color
        if (lowerBoundWhiteX < mouseX && mouseX < upperBoundWhiteX) addMana('w')
        if (lowerBoundBlueX < mouseX && mouseX < upperBoundBlueX) addMana('u')
        if (lowerBoundBlackX < mouseX && mouseX < upperBoundBlackX) addMana('b')
        if (lowerBoundRedX < mouseX && mouseX < upperBoundRedX) addMana('r')
        if (lowerBoundGreenX < mouseX && mouseX < upperBoundGreenX) addMana('g')
        if (lowerBoundColorlessX < mouseX && mouseX < upperBoundColorlessX) addMana('c')
        if (lowerBoundGoldX < mouseX && mouseX < upperBoundGoldX) addMana('m')
    } if (217 < mouseY && mouseY < 228) { // double color increment
        if (lowerBoundAzoriusX < mouseX && mouseX < upperBoundAzoriusX && azorius.numSelected < 9)
            azorius.increment()
        if (lowerBoundDimirX < mouseX && mouseX < upperBoundDimirX && dimir.numSelected < 9)
            dimir.increment()
        if (lowerBoundRakdosX < mouseX && mouseX < upperBoundRakdosX && rakdos.numSelected < 9)
            rakdos.increment()
        if (lowerBoundGruulX < mouseX && mouseX < upperBoundGruulX && gruul.numSelected < 9)
            gruul.increment()
        if (lowerBoundSelesnyaX < mouseX && mouseX < upperBoundSelesnyaX && selesnya.numSelected < 9)
            selesnya.increment()
        if (lowerBoundOrzhovX < mouseX && mouseX < upperBoundOrzhovX && orzhov.numSelected < 9)
            orzhov.increment()
        if (lowerBoundIzzetX < mouseX && mouseX < upperBoundIzzetX && izzet.numSelected < 9)
            izzet.increment()
        if (lowerBoundGolgariX < mouseX && mouseX < upperBoundGolgariX && golgari.numSelected < 9)
            golgari.increment()
        if (lowerBoundBorosX < mouseX && mouseX < upperBoundBorosX && boros.numSelected < 9)
            boros.increment()
        if (lowerBoundSimicX < mouseX && mouseX < upperBoundSimicX && simic.numSelected < 9)
            simic.increment()
    } if (228 < mouseY && mouseY < 236) { // double color decrement
        if (lowerBoundAzoriusX < mouseX && mouseX < upperBoundAzoriusX && azorius.numSelected > 0)
            azorius.decrement()
        if (lowerBoundDimirX < mouseX && mouseX < upperBoundDimirX && dimir.numSelected > 0)
            dimir.decrement()
        if (lowerBoundRakdosX < mouseX && mouseX < upperBoundRakdosX && rakdos.numSelected > 0)
            rakdos.decrement()
        if (lowerBoundGruulX < mouseX && mouseX < upperBoundGruulX && gruul.numSelected > 0)
            gruul.decrement()
        if (lowerBoundSelesnyaX < mouseX && mouseX < upperBoundSelesnyaX && selesnya.numSelected > 0)
            selesnya.decrement()
        if (lowerBoundOrzhovX < mouseX && mouseX < upperBoundOrzhovX && orzhov.numSelected > 0)
            orzhov.decrement()
        if (lowerBoundIzzetX < mouseX && mouseX < upperBoundIzzetX && izzet.numSelected > 0)
            izzet.decrement()
        if (lowerBoundGolgariX < mouseX && mouseX < upperBoundGolgariX && golgari.numSelected > 0)
            golgari.decrement()
        if (lowerBoundBorosX < mouseX && mouseX < upperBoundBorosX && boros.numSelected > 0)
            boros.decrement()
        if (lowerBoundSimicX < mouseX && mouseX < upperBoundSimicX && simic.numSelected > 0)
            simic.decrement()
    }

    for (let cardCMC in availableCardImages) {
        for (let trick of availableCardImages[cardCMC]) {
            trick.checkIsHovered()
            if (trick.hovered) {
                print(
                    `${trick.data["name"]} ${trick.data["mana_cost"]}\n` +
                    `${trick.data["type_line"]}\n` +
                    `${trick.data["oracle_text"]}\n` +
                    (("power" in trick.data) ? `${trick.data["power"]}/${trick.data["toughness"]}` : "")
                )
            }
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
            const TOP_PADDING = 3 /* extr a padding on top of the 1st line */

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

/** defines a hybrid color and displays it using image() and svg files */
class DoubleColor {
    /* Argument definition:
     * colorName → The prefix letter of the color
     * colorSymbol → The SVG file that is displayed when draw() is called
     * color → the color of the symbol that will be filled/tinted on draw()
     * x/y → defines the position of the image when drawn on draw() */
    constructor(colorName, colorSymbol1, colorSymbol2, color1, color2, x, y) {
        this.color1 = color1
        this.color2 = color2
        this.colorName = colorName
        this.colorSVGFile1 = colorSymbol1
        this.colorSVGFile2 = colorSymbol2
        this.xPosition = x
        this.yPosition = y
        /* the number of times the color has been selected */
        this.numSelected = 0
    }

    /* Argument definition:
     * NONE
     * Function definition:
     * Draws a little rectangle as a boundary, then displays both SVG files
     * at the top and displays how much is on it */
    draw() {
        let xPos = this.xPosition // just make a shorter reference here
        let yPos = this.yPosition // same here
        let width = 35 // the width of the symbol
        let height = 35 // the height of the symbol
        let padding = width/10 // the outer padding

        // display the outer grey rectangle
        noFill()
        stroke(0, 0, 75)
        strokeWeight(1.5)
        rect(xPos - padding, yPos - padding, xPos + width + padding, yPos + height + padding)

        // now draw the color symbols with their rectangle
        stroke(this.color1)
        rect(xPos - padding, yPos - padding, xPos + width/2, yPos + height/2)
        stroke(this.color2)
        rect(xPos + width/2, yPos - padding, xPos + width + padding, yPos + height/2)
        tint(this.color1)
        image(this.colorSVGFile1, xPos, yPos, width/2 - padding, height/2 - padding)
        tint(this.color2)
        image(this.colorSVGFile2, xPos + width/2 + padding, yPos, width/2 - padding, height/2 - padding)

        // now display the + and - symbols (used for clicking)
        noTint()
        noStroke()
        fill(0, 0, 50)
        rect(xPos - padding, yPos + height/2, xPos + width/3, yPos + height + padding)
        fill(0, 0, 45)
        // if you're hovering over any part of it, make sure to darken it slightly!
        if (mouseX > xPos - padding && mouseX < xPos + width/3 &&
            mouseY > yPos + height/2 && mouseY < yPos + 3*height/4 + padding)
            rect(xPos - padding, yPos + height/2, xPos + width/3, yPos + 3*height/4 + padding)
        if (mouseX > xPos - padding && mouseX < xPos + width/3 &&
            mouseY > yPos + 3*height/4 + padding && mouseY < yPos + height + padding)
            rect(xPos - padding, yPos + 3*height/4 + padding, xPos + width/3, yPos + height + padding)
        // if any of those are not applicable, make sure to darken it!
        fill(0, 0, 30)
        if (this.numSelected === 9) {
            rect(xPos - padding, yPos + height/2, xPos + width/3, yPos + 3*height/4 + padding)
        } if (this.numSelected === 0) {
            rect(xPos - padding, yPos + 3*height/4 + padding, xPos + width/3, yPos + height + padding)
        }
        fill(0, 0, 0)
        stroke(0, 0, 0)
        strokeWeight(1)
        line(xPos - padding, yPos + 3*height/4 + padding, xPos + width/3, yPos + 3*height/4 + padding)
        noStroke()
        textSize(10)
        text("+", xPos, yPos + 3*height/4)
        text("-", xPos + padding/2, yPos + height + padding/2) // - has less textwidth than +!
        textSize(20)
        fill(0, 0, 100)
        text(this.numSelected, xPos + width/2, yPos + height)
    }

    /* Nothing to describe */
    increment() {
        this.numSelected++
        print(findPossibleManaAvailableCombinations())
    }

    /* Nothing to describe */
    decrement() {
        this.numSelected--
        print(findPossibleManaAvailableCombinations())
    }
}

/** defines a color and displays it using image() and svg files */
class SingleColor {
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
    constructor(image, xPos, yPos, widthOfImage, hoverImage, data) {
        this.image = image
        this.image.resize(widthOfImage, 0)
        this.hoverImage = hoverImage
        this.hoverImage.resize(widthOfImage*3, 0)
        this.xPos = xPos
        this.yPos = yPos
        this.show = true
        this.hovered = false
        this.data = data
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