# p5-mtgCombatTricks
## Summary
Based on input colors, here we will find all the combat tricks that our opponent can cast and show the card image.


## Questions
### So...what does this search for?
This searches for all cards that you can cast using the mana that you selected. 

### What am I supposed to do?
You can technically see when entering the sketch, but I'll put the 
instructions here:

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
    ⚠ Do NOT press 'z' multiple times within a short time ⚠

### What can I do with my keyboard?
W/U/B/R/G/C/M: Increase white, blue, black, red, green, colorless, or 
multicolored mana respectively. Can be done by clicking symbol.
<br>w/u/b/r/g/c/m: Decrease white, blue, black, red, green, colorless, or
multicolored mana respectively. 

### How do you track dual-colored mana?
Click on the "+" or "-" button (if it's not greyed out). The button will 
darken when you mouse over it if it's not already greyed out. Always click 
in the center of the + or a little bit above the -. Sorry the buttons are so 
small 😓
<br>You can't decrease below 0 or increase above 9.
<br>If the sum of dual-colored mana exceeds 10, you may have problems. The 
sketch was not designed to calculate 1024 possibilities for what mana could 
cast a certain spell. (Or you can simply do it yourself.)
<br>[Increasing dual-colored mana](data/dual-colored mana.mp4)
(data/dual-colored mana.mp4)

### How do you interact with "disguise creatures not displayed" or "flash and instants displayed"?
Use "d" to toggle whether disguise creatures are displayed. Use "t" to 
toggle whether flash creatures or instants (tricks) are displayed. 
<br>As there are no disguise creatures in Aetherdrift (the current set) right 
now, "d" does nothing.

### Why is the canvas running at super low framerate *and* producing bad results when I try to update colors multiple times in a row?
The sketch was not designed for that. If you want better results, press "t" 
to disable loading tricks (if it's not already disabled), then increase the 
mana. (I created a [video](data/don't spam.mp4) (data/don't spam.mp4) for 
this showcasing what happens)
<br> If you are curious about what's really happening, the cause of the 
problem is that after the sketch loads images, it appends them. However, it 
takes time to load images, and if the sketch loads new images, the other 
image requests are ignored.

### What is this stupid thing at the bottom?
It's the debug corner. You can see your framerate there. Toggle it off using 
"`", or backtick.

### What are the 10 little rectangles that look kind of like calculators do?
These represent dual-colored mana. These are generally not used unless your 
opponent has dual-colored lands on the battlefield.
<br>[Increasing dual-colored mana](data/dual-colored mana.mp4) 
(data/dual-colored mana.mp4)

## Videos
Here's a [demo](data/demo.mp4) video of my project! Captions have not been 
added. (data/demo.mp4)
<br> Something you were not meant to do! Don't spam, because [this](data/don't spam.mp4) 
causes problems. (data/don't spam.mp4)
<br> What to press for [dual-colored mana](data/dual-colored mana.mp4) 
(data/dual-colored mana.mp4).