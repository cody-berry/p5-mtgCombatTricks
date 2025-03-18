# p5-mtgCombatTricks
## Summary
Based on input colors, here we will find all the combat tricks that our opponent can cast and show the card image.


## Questions
### What can I do with my keyboard?
W/U/B/R/G/C/M: Increase white, blue, black, red, green, colorless, or 
multicolored mana respectively. Can be done by clicking symbol.
<br>w/u/b/r/g/c/m: Decrease white, blue, black, red, green, colorless, or
multicolored mana respectively. 

### How do you increase dual-colored mana?
Click on the "+" or "-" button (if it's not greyed out). The button will 
darken when you mouse over it if it's not already greyed out because you 
can't decrease below 0 or increase above 9.

### How do you interact with "disguise creatures not displayed" or "flash and instants displayed"?
Use "d" to toggle whether disguise creatures are displayed. Use "t" to 
toggle whether flash creatures or instants (tricks) are displayed. 

### Why is my sketch running at super low framerate *and* producing bad results when I try to update colors multiple times in a row?
The sketch was not designed for that. If you want better results, press "t" 
to disable loading tricks (if it's not already disabled), then increase the 
mana. 
<br> If you are curious about what's really happening, the cause of the 
problem is that after the sketch loads images, it appends them. However, it 
takes time to load images, and if the sketch loads new images, the other 
image requests are ignored.
<br> Please don't light your computer on fire.

### Why is my sketch running at low framerate right after updating colors?
The sketch will likely be processing 10+ images at a time, which might slow 
it down.