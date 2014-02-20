// CodeMirror version 2.2
//
// All functions that need access to the editor's state live inside
// the CodeMirror function. Below that, at the bottom of the file,
// some utilities are defined.

var CodeMirror=(function(){function CodeMirror(place,givenOptions){var options={},defaults=CodeMirror.defaults;for(var opt in defaults)
if(defaults.hasOwnProperty(opt))
options[opt]=(givenOptions&&givenOptions.hasOwnProperty(opt)?givenOptions:defaults)[opt];var targetDocument=options["document"];var wrapper=targetDocument.createElement("div");wrapper.className="CodeMirror"+(options.lineWrapping?" CodeMirror-wrap":"");wrapper.innerHTML='<div style="overflow: hidden; position: relative; width: 3px; height: 0px;">'+'<textarea style="position: absolute; padding: 0; width: 1px;" wrap="off" '+'autocorrect="off" autocapitalize="off"></textarea></div>'+'<div class="CodeMirror-scroll" tabindex="-1">'+'<div style="position: relative">'+'<div style="position: relative">'+'<div class="CodeMirror-gutter"><div class="CodeMirror-gutter-text"></div></div>'+'<div class="CodeMirror-lines"><div style="position: relative">'+'<div style="position: absolute; width: 100%; height: 0; overflow: hidden; visibility: hidden"></div>'+'<pre class="CodeMirror-cursor">&#160;</pre>'+'<div></div>'+'</div></div></div></div></div>';if(place.appendChild)place.appendChild(wrapper);else place(wrapper);var inputDiv=wrapper.firstChild,input=inputDiv.firstChild,scroller=wrapper.lastChild,code=scroller.firstChild,mover=code.firstChild,gutter=mover.firstChild,gutterText=gutter.firstChild,lineSpace=gutter.nextSibling.firstChild,measure=lineSpace.firstChild,cursor=measure.nextSibling,lineDiv=cursor.nextSibling;themeChanged();if(/AppleWebKit/.test(navigator.userAgent)&&/Mobile\/\w+/.test(navigator.userAgent))input.style.width="0px";if(!webkit)lineSpace.draggable=true;if(options.tabindex!=null)input.tabIndex=options.tabindex;if(!options.gutter&&!options.lineNumbers)gutter.style.display="none";try{stringWidth("x");}
catch(e){if(e.message.match(/runtime/i))
e=new Error("A CodeMirror inside a P-style element does not work in Internet Explorer. (innerHTML bug)");throw e;}
var poll=new Delayed(),highlight=new Delayed(),blinker;var mode,doc=new BranchChunk([new LeafChunk([new Line("")])]),work,focused;loadMode();var sel={from:{line:0,ch:0},to:{line:0,ch:0},inverted:false};var shiftSelecting,lastClick,lastDoubleClick,draggingText,overwrite=false;var updateInput,userSelChange,changes,textChanged,selectionChanged,leaveInputAlone,gutterDirty,callbacks;var displayOffset=0,showingFrom=0,showingTo=0,lastSizeC=0;var bracketHighlighted;var maxLine="",maxWidth,tabText=computeTabText();operation(function(){setValue(options.value||"");updateInput=false;})();var history=new History();connect(scroller,"mousedown",operation(onMouseDown));connect(scroller,"dblclick",operation(onDoubleClick));connect(lineSpace,"dragstart",onDragStart);connect(lineSpace,"selectstart",e_preventDefault);if(!gecko)connect(scroller,"contextmenu",onContextMenu);connect(scroller,"scroll",function(){updateDisplay([]);if(options.fixedGutter)gutter.style.left=scroller.scrollLeft+"px";if(options.onScroll)options.onScroll(instance);});connect(window,"resize",function(){updateDisplay(true);});connect(input,"keyup",operation(onKeyUp));connect(input,"input",fastPoll);connect(input,"keydown",operation(onKeyDown));connect(input,"keypress",operation(onKeyPress));connect(input,"focus",onFocus);connect(input,"blur",onBlur);connect(scroller,"dragenter",e_stop);connect(scroller,"dragover",e_stop);connect(scroller,"drop",operation(onDrop));connect(scroller,"paste",function(){focusInput();fastPoll();});connect(input,"paste",fastPoll);connect(input,"cut",operation(function(){replaceSelection("");}));var hasFocus;try{hasFocus=(targetDocument.activeElement==input);}catch(e){}
if(hasFocus)setTimeout(onFocus,20);else onBlur();function isLine(l){return l>=0&&l<doc.size;}
var instance=wrapper.CodeMirror={getValue:getValue,setValue:operation(setValue),getSelection:getSelection,replaceSelection:operation(replaceSelection),focus:function(){focusInput();onFocus();fastPoll();},setOption:function(option,value){var oldVal=options[option];options[option]=value;if(option=="mode"||option=="indentUnit")loadMode();else if(option=="readOnly"&&value){onBlur();input.blur();}
else if(option=="theme")themeChanged();else if(option=="lineWrapping"&&oldVal!=value)operation(wrappingChanged)();else if(option=="tabSize")operation(tabsChanged)();if(option=="lineNumbers"||option=="gutter"||option=="firstLineNumber"||option=="theme")
operation(gutterChanged)();},getOption:function(option){return options[option];},undo:operation(undo),redo:operation(redo),indentLine:operation(function(n,dir){if(isLine(n))indentLine(n,dir==null?"smart":dir?"add":"subtract");}),indentSelection:operation(indentSelected),historySize:function(){return{undo:history.done.length,redo:history.undone.length};},clearHistory:function(){history=new History();},matchBrackets:operation(function(){matchBrackets(true);}),getTokenAt:operation(function(pos){pos=clipPos(pos);return getLine(pos.line).getTokenAt(mode,getStateBefore(pos.line),pos.ch);}),getStateAfter:function(line){line=clipLine(line==null?doc.size-1:line);return getStateBefore(line+1);},cursorCoords:function(start){if(start==null)start=sel.inverted;return pageCoords(start?sel.from:sel.to);},charCoords:function(pos){return pageCoords(clipPos(pos));},coordsChar:function(coords){var off=eltOffset(lineSpace);return coordsChar(coords.x-off.left,coords.y-off.top);},markText:operation(markText),setBookmark:setBookmark,setMarker:operation(addGutterMarker),clearMarker:operation(removeGutterMarker),setLineClass:operation(setLineClass),hideLine:operation(function(h){return setLineHidden(h,true);}),showLine:operation(function(h){return setLineHidden(h,false);}),onDeleteLine:function(line,f){if(typeof line=="number"){if(!isLine(line))return null;line=getLine(line);}
(line.handlers||(line.handlers=[])).push(f);return line;},lineInfo:lineInfo,addWidget:function(pos,node,scroll,vert,horiz){pos=localCoords(clipPos(pos));var top=pos.yBot,left=pos.x;node.style.position="absolute";code.appendChild(node);if(vert=="over")top=pos.y;else if(vert=="near"){var vspace=Math.max(scroller.offsetHeight,doc.height*textHeight()),hspace=Math.max(code.clientWidth,lineSpace.clientWidth)-paddingLeft();if(pos.yBot+node.offsetHeight>vspace&&pos.y>node.offsetHeight)
top=pos.y-node.offsetHeight;if(left+node.offsetWidth>hspace)
left=hspace-node.offsetWidth;}
node.style.top=(top+paddingTop())+"px";node.style.left=node.style.right="";if(horiz=="right"){left=code.clientWidth-node.offsetWidth;node.style.right="0px";}else{if(horiz=="left")left=0;else if(horiz=="middle")left=(code.clientWidth-node.offsetWidth)/2;node.style.left=(left+paddingLeft())+"px";}
if(scroll)
scrollIntoView(left,top,left+node.offsetWidth,top+node.offsetHeight);},lineCount:function(){return doc.size;},clipPos:clipPos,getCursor:function(start){if(start==null)start=sel.inverted;return copyPos(start?sel.from:sel.to);},somethingSelected:function(){return!posEq(sel.from,sel.to);},setCursor:operation(function(line,ch,user){if(ch==null&&typeof line.line=="number")setCursor(line.line,line.ch,user);else setCursor(line,ch,user);}),setSelection:operation(function(from,to,user){(user?setSelectionUser:setSelection)(clipPos(from),clipPos(to||from));}),getLine:function(line){if(isLine(line))return getLine(line).text;},getLineHandle:function(line){if(isLine(line))return getLine(line);},setLine:operation(function(line,text){if(isLine(line))replaceRange(text,{line:line,ch:0},{line:line,ch:getLine(line).text.length});}),removeLine:operation(function(line){if(isLine(line))replaceRange("",{line:line,ch:0},clipPos({line:line+1,ch:0}));}),replaceRange:operation(replaceRange),getRange:function(from,to){return getRange(clipPos(from),clipPos(to));},execCommand:function(cmd){return commands[cmd](instance);},moveH:operation(moveH),deleteH:operation(deleteH),moveV:operation(moveV),toggleOverwrite:function(){overwrite=!overwrite;},posFromIndex:function(off){var lineNo=0,ch;doc.iter(0,doc.size,function(line){var sz=line.text.length+1;if(sz>off){ch=off;return true;}
off-=sz;++lineNo;});return clipPos({line:lineNo,ch:ch});},indexFromPos:function(coords){if(coords.line<0||coords.ch<0)return 0;var index=coords.ch;doc.iter(0,coords.line,function(line){index+=line.text.length+1;});return index;},operation:function(f){return operation(f)();},refresh:function(){updateDisplay(true);},getInputField:function(){return input;},getWrapperElement:function(){return wrapper;},getScrollerElement:function(){return scroller;},getGutterElement:function(){return gutter;}};function getLine(n){return getLineAt(doc,n);}
function updateLineHeight(line,height){gutterDirty=true;var diff=height-line.height;for(var n=line;n;n=n.parent)n.height+=diff;}
function setValue(code){var top={line:0,ch:0};updateLines(top,{line:doc.size-1,ch:getLine(doc.size-1).text.length},splitLines(code),top,top);updateInput=true;}
function getValue(code){var text=[];doc.iter(0,doc.size,function(line){text.push(line.text);});return text.join("\n");}
function onMouseDown(e){setShift(e.shiftKey);for(var n=e_target(e);n!=wrapper;n=n.parentNode)
if(n.parentNode==code&&n!=mover)return;for(var n=e_target(e);n!=wrapper;n=n.parentNode)
if(n.parentNode==gutterText){if(options.onGutterClick)
options.onGutterClick(instance,indexOf(gutterText.childNodes,n)+showingFrom,e);return e_preventDefault(e);}
var start=posFromMouse(e);switch(e_button(e)){case 3:if(gecko&&!mac)onContextMenu(e);return;case 2:if(start)setCursor(start.line,start.ch,true);return;}
if(!start){if(e_target(e)==scroller)e_preventDefault(e);return;}
if(!focused)onFocus();var now=+new Date;if(lastDoubleClick&&lastDoubleClick.time>now-400&&posEq(lastDoubleClick.pos,start)){e_preventDefault(e);setTimeout(focusInput,20);return selectLine(start.line);}else if(lastClick&&lastClick.time>now-400&&posEq(lastClick.pos,start)){lastDoubleClick={time:now,pos:start};e_preventDefault(e);return selectWordAt(start);}else{lastClick={time:now,pos:start};}
var last=start,going;if(dragAndDrop&&!posEq(sel.from,sel.to)&&!posLess(start,sel.from)&&!posLess(sel.to,start)){if(webkit)lineSpace.draggable=true;var up=connect(targetDocument,"mouseup",operation(function(e2){if(webkit)lineSpace.draggable=false;draggingText=false;up();if(Math.abs(e.clientX-e2.clientX)+Math.abs(e.clientY-e2.clientY)<10){e_preventDefault(e2);setCursor(start.line,start.ch,true);focusInput();}}),true);draggingText=true;return;}
e_preventDefault(e);setCursor(start.line,start.ch,true);function extend(e){var cur=posFromMouse(e,true);if(cur&&!posEq(cur,last)){if(!focused)onFocus();last=cur;setSelectionUser(start,cur);updateInput=false;var visible=visibleLines();if(cur.line>=visible.to||cur.line<visible.from)
going=setTimeout(operation(function(){extend(e);}),150);}}
var move=connect(targetDocument,"mousemove",operation(function(e){clearTimeout(going);e_preventDefault(e);extend(e);}),true);var up=connect(targetDocument,"mouseup",operation(function(e){clearTimeout(going);var cur=posFromMouse(e);if(cur)setSelectionUser(start,cur);e_preventDefault(e);focusInput();updateInput=true;move();up();}),true);}
function onDoubleClick(e){for(var n=e_target(e);n!=wrapper;n=n.parentNode)
if(n.parentNode==gutterText)return e_preventDefault(e);var start=posFromMouse(e);if(!start)return;lastDoubleClick={time:+new Date,pos:start};e_preventDefault(e);selectWordAt(start);}
function onDrop(e){e.preventDefault();var pos=posFromMouse(e,true),files=e.dataTransfer.files;if(!pos||options.readOnly)return;if(files&&files.length&&window.FileReader&&window.File){function loadFile(file,i){var reader=new FileReader;reader.onload=function(){text[i]=reader.result;if(++read==n){pos=clipPos(pos);operation(function(){var end=replaceRange(text.join(""),pos,pos);setSelectionUser(pos,end);})();}};reader.readAsText(file);}
var n=files.length,text=Array(n),read=0;for(var i=0;i<n;++i)loadFile(files[i],i);}
else{try{var text=e.dataTransfer.getData("Text");if(text){var end=replaceRange(text,pos,pos);var curFrom=sel.from,curTo=sel.to;setSelectionUser(pos,end);if(draggingText)replaceRange("",curFrom,curTo);focusInput();}}
catch(e){}}}
function onDragStart(e){var txt=getSelection();htmlEscape(txt);e.dataTransfer.setDragImage(escapeElement,0,0);e.dataTransfer.setData("Text",txt);}
function handleKeyBinding(e){var name=keyNames[e.keyCode],next=keyMap[options.keyMap].auto,bound,dropShift;if(name==null||e.altGraphKey){if(next)options.keyMap=next;return null;}
if(e.altKey)name="Alt-"+name;if(e.ctrlKey)name="Ctrl-"+name;if(e.metaKey)name="Cmd-"+name;if(e.shiftKey&&(bound=lookupKey("Shift-"+name,options.extraKeys,options.keyMap))){dropShift=true;}else{bound=lookupKey(name,options.extraKeys,options.keyMap);}
if(typeof bound=="string"){if(commands.propertyIsEnumerable(bound))bound=commands[bound];else bound=null;}
if(next&&(bound||!isModifierKey(e)))options.keyMap=next;if(!bound)return false;if(dropShift){var prevShift=shiftSelecting;shiftSelecting=null;bound(instance);shiftSelecting=prevShift;}else bound(instance);e_preventDefault(e);return true;}
var lastStoppedKey=null;function onKeyDown(e){if(!focused)onFocus();var code=e.keyCode;if(ie&&code==27){e.returnValue=false;}
setShift(code==16||e.shiftKey);if(options.onKeyEvent&&options.onKeyEvent(instance,addStop(e)))return;var handled=handleKeyBinding(e);if(window.opera){lastStoppedKey=handled?e.keyCode:null;if(!handled&&(mac?e.metaKey:e.ctrlKey)&&e.keyCode==88)
replaceSelection("");}}
function onKeyPress(e){if(window.opera&&e.keyCode==lastStoppedKey){lastStoppedKey=null;e_preventDefault(e);return;}
if(options.onKeyEvent&&options.onKeyEvent(instance,addStop(e)))return;if(window.opera&&!e.which&&handleKeyBinding(e))return;if(options.electricChars&&mode.electricChars){var ch=String.fromCharCode(e.charCode==null?e.keyCode:e.charCode);if(mode.electricChars.indexOf(ch)>-1)
setTimeout(operation(function(){indentLine(sel.to.line,"smart");}),75);}
fastPoll();}
function onKeyUp(e){if(options.onKeyEvent&&options.onKeyEvent(instance,addStop(e)))return;if(e.keyCode==16)shiftSelecting=null;}
function onFocus(){if(options.readOnly)return;if(!focused){if(options.onFocus)options.onFocus(instance);focused=true;if(wrapper.className.search(/\bCodeMirror-focused\b/)==-1)
wrapper.className+=" CodeMirror-focused";if(!leaveInputAlone)resetInput(true);}
slowPoll();restartBlink();}
function onBlur(){if(focused){if(options.onBlur)options.onBlur(instance);focused=false;wrapper.className=wrapper.className.replace(" CodeMirror-focused","");}
clearInterval(blinker);setTimeout(function(){if(!focused)shiftSelecting=null;},150);}
function updateLines(from,to,newText,selFrom,selTo){if(history){var old=[];doc.iter(from.line,to.line+1,function(line){old.push(line.text);});history.addChange(from.line,newText.length,old);while(history.done.length>options.undoDepth)history.done.shift();}
updateLinesNoUndo(from,to,newText,selFrom,selTo);}
function unredoHelper(from,to){var change=from.pop();if(change){var replaced=[],end=change.start+change.added;doc.iter(change.start,end,function(line){replaced.push(line.text);});to.push({start:change.start,added:change.old.length,old:replaced});var pos=clipPos({line:change.start+change.old.length-1,ch:editEnd(replaced[replaced.length-1],change.old[change.old.length-1])});updateLinesNoUndo({line:change.start,ch:0},{line:end-1,ch:getLine(end-1).text.length},change.old,pos,pos);updateInput=true;}}
function undo(){unredoHelper(history.done,history.undone);}
function redo(){unredoHelper(history.undone,history.done);}
function updateLinesNoUndo(from,to,newText,selFrom,selTo){var recomputeMaxLength=false,maxLineLength=maxLine.length;if(!options.lineWrapping)
doc.iter(from.line,to.line,function(line){if(line.text.length==maxLineLength){recomputeMaxLength=true;return true;}});if(from.line!=to.line||newText.length>1)gutterDirty=true;var nlines=to.line-from.line,firstLine=getLine(from.line),lastLine=getLine(to.line);if(from.ch==0&&to.ch==0&&newText[newText.length-1]==""){var added=[],prevLine=null;if(from.line){prevLine=getLine(from.line-1);prevLine.fixMarkEnds(lastLine);}else lastLine.fixMarkStarts();for(var i=0,e=newText.length-1;i<e;++i)
added.push(Line.inheritMarks(newText[i],prevLine));if(nlines)doc.remove(from.line,nlines,callbacks);if(added.length)doc.insert(from.line,added);}else if(firstLine==lastLine){if(newText.length==1)
firstLine.replace(from.ch,to.ch,newText[0]);else{lastLine=firstLine.split(to.ch,newText[newText.length-1]);firstLine.replace(from.ch,null,newText[0]);firstLine.fixMarkEnds(lastLine);var added=[];for(var i=1,e=newText.length-1;i<e;++i)
added.push(Line.inheritMarks(newText[i],firstLine));added.push(lastLine);doc.insert(from.line+1,added);}}else if(newText.length==1){firstLine.replace(from.ch,null,newText[0]);lastLine.replace(null,to.ch,"");firstLine.append(lastLine);doc.remove(from.line+1,nlines,callbacks);}else{var added=[];firstLine.replace(from.ch,null,newText[0]);lastLine.replace(null,to.ch,newText[newText.length-1]);firstLine.fixMarkEnds(lastLine);for(var i=1,e=newText.length-1;i<e;++i)
added.push(Line.inheritMarks(newText[i],firstLine));if(nlines>1)doc.remove(from.line+1,nlines-1,callbacks);doc.insert(from.line+1,added);}
if(options.lineWrapping){var perLine=scroller.clientWidth/charWidth()-3;doc.iter(from.line,from.line+newText.length,function(line){if(line.hidden)return;var guess=Math.ceil(line.text.length/perLine)||1;if(guess!=line.height)updateLineHeight(line,guess);});}else{doc.iter(from.line,i+newText.length,function(line){var l=line.text;if(l.length>maxLineLength){maxLine=l;maxLineLength=l.length;maxWidth=null;recomputeMaxLength=false;}});if(recomputeMaxLength){maxLineLength=0;maxLine="";maxWidth=null;doc.iter(0,doc.size,function(line){var l=line.text;if(l.length>maxLineLength){maxLineLength=l.length;maxLine=l;}});}}
var newWork=[],lendiff=newText.length-nlines-1;for(var i=0,l=work.length;i<l;++i){var task=work[i];if(task<from.line)newWork.push(task);else if(task>to.line)newWork.push(task+lendiff);}
var hlEnd=from.line+Math.min(newText.length,500);highlightLines(from.line,hlEnd);newWork.push(hlEnd);work=newWork;startWorker(100);changes.push({from:from.line,to:to.line+1,diff:lendiff});var changeObj={from:from,to:to,text:newText};if(textChanged){for(var cur=textChanged;cur.next;cur=cur.next){}
cur.next=changeObj;}else textChanged=changeObj;function updateLine(n){return n<=Math.min(to.line,to.line+lendiff)?n:n+lendiff;}
setSelection(selFrom,selTo,updateLine(sel.from.line),updateLine(sel.to.line));code.style.height=(doc.height*textHeight()+2*paddingTop())+"px";}
function replaceRange(code,from,to){from=clipPos(from);if(!to)to=from;else to=clipPos(to);code=splitLines(code);function adjustPos(pos){if(posLess(pos,from))return pos;if(!posLess(to,pos))return end;var line=pos.line+code.length-(to.line-from.line)-1;var ch=pos.ch;if(pos.line==to.line)
ch+=code[code.length-1].length-(to.ch-(to.line==from.line?from.ch:0));return{line:line,ch:ch};}
var end;replaceRange1(code,from,to,function(end1){end=end1;return{from:adjustPos(sel.from),to:adjustPos(sel.to)};});return end;}
function replaceSelection(code,collapse){replaceRange1(splitLines(code),sel.from,sel.to,function(end){if(collapse=="end")return{from:end,to:end};else if(collapse=="start")return{from:sel.from,to:sel.from};else return{from:sel.from,to:end};});}
function replaceRange1(code,from,to,computeSel){var endch=code.length==1?code[0].length+from.ch:code[code.length-1].length;var newSel=computeSel({line:from.line+code.length-1,ch:endch});updateLines(from,to,code,newSel.from,newSel.to);}
function getRange(from,to){var l1=from.line,l2=to.line;if(l1==l2)return getLine(l1).text.slice(from.ch,to.ch);var code=[getLine(l1).text.slice(from.ch)];doc.iter(l1+1,l2,function(line){code.push(line.text);});code.push(getLine(l2).text.slice(0,to.ch));return code.join("\n");}
function getSelection(){return getRange(sel.from,sel.to);}
var pollingFast=false;function slowPoll(){if(pollingFast)return;poll.set(options.pollInterval,function(){startOperation();readInput();if(focused)slowPoll();endOperation();});}
function fastPoll(){var missed=false;pollingFast=true;function p(){startOperation();var changed=readInput();if(!changed&&!missed){missed=true;poll.set(60,p);}
else{pollingFast=false;slowPoll();}
endOperation();}
poll.set(20,p);}
var prevInput="";function readInput(){if(leaveInputAlone||!focused||hasSelection(input))return false;var text=input.value;if(text==prevInput)return false;shiftSelecting=null;var same=0,l=Math.min(prevInput.length,text.length);while(same<l&&prevInput[same]==text[same])++same;if(same<prevInput.length)
sel.from={line:sel.from.line,ch:sel.from.ch-(prevInput.length-same)};else if(overwrite&&posEq(sel.from,sel.to))
sel.to={line:sel.to.line,ch:Math.min(getLine(sel.to.line).text.length,sel.to.ch+(text.length-same))};replaceSelection(text.slice(same),"end");prevInput=text;return true;}
function resetInput(user){if(!posEq(sel.from,sel.to)){prevInput="";input.value=getSelection();input.select();}else if(user)prevInput=input.value="";}
function focusInput(){if(!options.readOnly)input.focus();}
function scrollEditorIntoView(){if(!cursor.getBoundingClientRect)return;var rect=cursor.getBoundingClientRect();if(ie&&rect.top==rect.bottom)return;var winH=window.innerHeight||Math.max(document.body.offsetHeight,document.documentElement.offsetHeight);if(rect.top<0||rect.bottom>winH)cursor.scrollIntoView();}
function scrollCursorIntoView(){var cursor=localCoords(sel.inverted?sel.from:sel.to);var x=options.lineWrapping?Math.min(cursor.x,lineSpace.offsetWidth):cursor.x;return scrollIntoView(x,cursor.y,x,cursor.yBot);}
function scrollIntoView(x1,y1,x2,y2){var pl=paddingLeft(),pt=paddingTop(),lh=textHeight();y1+=pt;y2+=pt;x1+=pl;x2+=pl;var screen=scroller.clientHeight,screentop=scroller.scrollTop,scrolled=false,result=true;if(y1<screentop){scroller.scrollTop=Math.max(0,y1-2*lh);scrolled=true;}
else if(y2>screentop+screen){scroller.scrollTop=y2+lh-screen;scrolled=true;}
var screenw=scroller.clientWidth,screenleft=scroller.scrollLeft;var gutterw=options.fixedGutter?gutter.clientWidth:0;if(x1<screenleft+gutterw){if(x1<50)x1=0;scroller.scrollLeft=Math.max(0,x1-10-gutterw);scrolled=true;}
else if(x2>screenw+screenleft-3){scroller.scrollLeft=x2+10-screenw;scrolled=true;if(x2>code.clientWidth)result=false;}
if(scrolled&&options.onScroll)options.onScroll(instance);return result;}
function visibleLines(){var lh=textHeight(),top=scroller.scrollTop-paddingTop();var from_height=Math.max(0,Math.floor(top/lh));var to_height=Math.ceil((top+scroller.clientHeight)/lh);return{from:lineAtHeight(doc,from_height),to:lineAtHeight(doc,to_height)};}
function updateDisplay(changes,suppressCallback){if(!scroller.clientWidth){showingFrom=showingTo=displayOffset=0;return;}
var visible=visibleLines();if(changes!==true&&changes.length==0&&visible.from>=showingFrom&&visible.to<=showingTo)return;var from=Math.max(visible.from-100,0),to=Math.min(doc.size,visible.to+100);if(showingFrom<from&&from-showingFrom<20)from=showingFrom;if(showingTo>to&&showingTo-to<20)to=Math.min(doc.size,showingTo);var intact=changes===true?[]:computeIntact([{from:showingFrom,to:showingTo,domStart:0}],changes);var intactLines=0;for(var i=0;i<intact.length;++i){var range=intact[i];if(range.from<from){range.domStart+=(from-range.from);range.from=from;}
if(range.to>to)range.to=to;if(range.from>=range.to)intact.splice(i--,1);else intactLines+=range.to-range.from;}
if(intactLines==to-from)return;intact.sort(function(a,b){return a.domStart-b.domStart;});var th=textHeight(),gutterDisplay=gutter.style.display;lineDiv.style.display=gutter.style.display="none";patchDisplay(from,to,intact);lineDiv.style.display="";var different=from!=showingFrom||to!=showingTo||lastSizeC!=scroller.clientHeight+th;if(different)lastSizeC=scroller.clientHeight+th;showingFrom=from;showingTo=to;displayOffset=heightAtLine(doc,from);mover.style.top=(displayOffset*th)+"px";code.style.height=(doc.height*th+2*paddingTop())+"px";if(lineDiv.childNodes.length!=showingTo-showingFrom)
throw new Error("BAD PATCH! "+JSON.stringify(intact)+" size="+(showingTo-showingFrom)+" nodes="+lineDiv.childNodes.length);if(options.lineWrapping){maxWidth=scroller.clientWidth;var curNode=lineDiv.firstChild;doc.iter(showingFrom,showingTo,function(line){if(!line.hidden){var height=Math.round(curNode.offsetHeight/th)||1;if(line.height!=height){updateLineHeight(line,height);gutterDirty=true;}}
curNode=curNode.nextSibling;});}else{if(maxWidth==null)maxWidth=stringWidth(maxLine);if(maxWidth>scroller.clientWidth){lineSpace.style.width=maxWidth+"px";code.style.width="";code.style.width=scroller.scrollWidth+"px";}else{lineSpace.style.width=code.style.width="";}}
gutter.style.display=gutterDisplay;if(different||gutterDirty)updateGutter();updateCursor();if(!suppressCallback&&options.onUpdate)options.onUpdate(instance);return true;}
function computeIntact(intact,changes){for(var i=0,l=changes.length||0;i<l;++i){var change=changes[i],intact2=[],diff=change.diff||0;for(var j=0,l2=intact.length;j<l2;++j){var range=intact[j];if(change.to<=range.from&&change.diff)
intact2.push({from:range.from+diff,to:range.to+diff,domStart:range.domStart});else if(change.to<=range.from||change.from>=range.to)
intact2.push(range);else{if(change.from>range.from)
intact2.push({from:range.from,to:change.from,domStart:range.domStart});if(change.to<range.to)
intact2.push({from:change.to+diff,to:range.to+diff,domStart:range.domStart+(change.to-range.from)});}}
intact=intact2;}
return intact;}
function patchDisplay(from,to,intact){if(!intact.length)lineDiv.innerHTML="";else{function killNode(node){var tmp=node.nextSibling;node.parentNode.removeChild(node);return tmp;}
var domPos=0,curNode=lineDiv.firstChild,n;for(var i=0;i<intact.length;++i){var cur=intact[i];while(cur.domStart>domPos){curNode=killNode(curNode);domPos++;}
for(var j=0,e=cur.to-cur.from;j<e;++j){curNode=curNode.nextSibling;domPos++;}}
while(curNode)curNode=killNode(curNode);}
var nextIntact=intact.shift(),curNode=lineDiv.firstChild,j=from;var sfrom=sel.from.line,sto=sel.to.line,inSel=sfrom<from&&sto>=from;var scratch=targetDocument.createElement("div"),newElt;doc.iter(from,to,function(line){var ch1=null,ch2=null;if(inSel){ch1=0;if(sto==j){inSel=false;ch2=sel.to.ch;}}else if(sfrom==j){if(sto==j){ch1=sel.from.ch;ch2=sel.to.ch;}
else{inSel=true;ch1=sel.from.ch;}}
if(nextIntact&&nextIntact.to==j)nextIntact=intact.shift();if(!nextIntact||nextIntact.from>j){if(line.hidden)scratch.innerHTML="<pre></pre>";else scratch.innerHTML=line.getHTML(ch1,ch2,true,tabText);lineDiv.insertBefore(scratch.firstChild,curNode);}else{curNode=curNode.nextSibling;}
++j;});}
function updateGutter(){if(!options.gutter&&!options.lineNumbers)return;var hText=mover.offsetHeight,hEditor=scroller.clientHeight;gutter.style.height=(hText-hEditor<2?hEditor:hText)+"px";var html=[],i=showingFrom;doc.iter(showingFrom,Math.max(showingTo,showingFrom+1),function(line){if(line.hidden){html.push("<pre></pre>");}else{var marker=line.gutterMarker;var text=options.lineNumbers?i+options.firstLineNumber:null;if(marker&&marker.text)
text=marker.text.replace("%N%",text!=null?text:"");else if(text==null)
text="\u00a0";html.push((marker&&marker.style?'<pre class="'+marker.style+'">':"<pre>"),text);for(var j=1;j<line.height;++j)html.push("<br/>&#160;");html.push("</pre>");}
++i;});gutter.style.display="none";gutterText.innerHTML=html.join("");var minwidth=String(doc.size).length,firstNode=gutterText.firstChild,val=eltText(firstNode),pad="";while(val.length+pad.length<minwidth)pad+="\u00a0";if(pad)firstNode.insertBefore(targetDocument.createTextNode(pad),firstNode.firstChild);gutter.style.display="";lineSpace.style.marginLeft=gutter.offsetWidth+"px";gutterDirty=false;}
function updateCursor(){var head=sel.inverted?sel.from:sel.to,lh=textHeight();var pos=localCoords(head,true);var wrapOff=eltOffset(wrapper),lineOff=eltOffset(lineDiv);inputDiv.style.top=(pos.y+lineOff.top-wrapOff.top)+"px";inputDiv.style.left=(pos.x+lineOff.left-wrapOff.left)+"px";if(posEq(sel.from,sel.to)){cursor.style.top=pos.y+"px";cursor.style.left=(options.lineWrapping?Math.min(pos.x,lineSpace.offsetWidth):pos.x)+"px";cursor.style.display="";}
else cursor.style.display="none";}
function setShift(val){if(val)shiftSelecting=shiftSelecting||(sel.inverted?sel.to:sel.from);else shiftSelecting=null;}
function setSelectionUser(from,to){var sh=shiftSelecting&&clipPos(shiftSelecting);if(sh){if(posLess(sh,from))from=sh;else if(posLess(to,sh))to=sh;}
setSelection(from,to);userSelChange=true;}
function setSelection(from,to,oldFrom,oldTo){goalColumn=null;if(oldFrom==null){oldFrom=sel.from.line;oldTo=sel.to.line;}
if(posEq(sel.from,from)&&posEq(sel.to,to))return;if(posLess(to,from)){var tmp=to;to=from;from=tmp;}
if(from.line!=oldFrom)from=skipHidden(from,oldFrom,sel.from.ch);if(to.line!=oldTo)to=skipHidden(to,oldTo,sel.to.ch);if(posEq(from,to))sel.inverted=false;else if(posEq(from,sel.to))sel.inverted=false;else if(posEq(to,sel.from))sel.inverted=true;if(posEq(from,to)){if(!posEq(sel.from,sel.to))
changes.push({from:oldFrom,to:oldTo+1});}
else if(posEq(sel.from,sel.to)){changes.push({from:from.line,to:to.line+1});}
else{if(!posEq(from,sel.from)){if(from.line<oldFrom)
changes.push({from:from.line,to:Math.min(to.line,oldFrom)+1});else
changes.push({from:oldFrom,to:Math.min(oldTo,from.line)+1});}
if(!posEq(to,sel.to)){if(to.line<oldTo)
changes.push({from:Math.max(oldFrom,from.line),to:oldTo+1});else
changes.push({from:Math.max(from.line,oldTo),to:to.line+1});}}
sel.from=from;sel.to=to;selectionChanged=true;}
function skipHidden(pos,oldLine,oldCh){function getNonHidden(dir){var lNo=pos.line+dir,end=dir==1?doc.size:-1;while(lNo!=end){var line=getLine(lNo);if(!line.hidden){var ch=pos.ch;if(ch>oldCh||ch>line.text.length)ch=line.text.length;return{line:lNo,ch:ch};}
lNo+=dir;}}
var line=getLine(pos.line);if(!line.hidden)return pos;if(pos.line>=oldLine)return getNonHidden(1)||getNonHidden(-1);else return getNonHidden(-1)||getNonHidden(1);}
function setCursor(line,ch,user){var pos=clipPos({line:line,ch:ch||0});(user?setSelectionUser:setSelection)(pos,pos);}
function clipLine(n){return Math.max(0,Math.min(n,doc.size-1));}
function clipPos(pos){if(pos.line<0)return{line:0,ch:0};if(pos.line>=doc.size)return{line:doc.size-1,ch:getLine(doc.size-1).text.length};var ch=pos.ch,linelen=getLine(pos.line).text.length;if(ch==null||ch>linelen)return{line:pos.line,ch:linelen};else if(ch<0)return{line:pos.line,ch:0};else return pos;}
function findPosH(dir,unit){var end=sel.inverted?sel.from:sel.to,line=end.line,ch=end.ch;var lineObj=getLine(line);function findNextLine(){for(var l=line+dir,e=dir<0?-1:doc.size;l!=e;l+=dir){var lo=getLine(l);if(!lo.hidden){line=l;lineObj=lo;return true;}}}
function moveOnce(boundToLine){if(ch==(dir<0?0:lineObj.text.length)){if(!boundToLine&&findNextLine())ch=dir<0?lineObj.text.length:0;else return false;}else ch+=dir;return true;}
if(unit=="char")moveOnce();else if(unit=="column")moveOnce(true);else if(unit=="word"){var sawWord=false;for(;;){if(dir<0)if(!moveOnce())break;if(isWordChar(lineObj.text.charAt(ch)))sawWord=true;else if(sawWord){if(dir<0){dir=1;moveOnce();}break;}
if(dir>0)if(!moveOnce())break;}}
return{line:line,ch:ch};}
function moveH(dir,unit){var pos=dir<0?sel.from:sel.to;if(shiftSelecting||posEq(sel.from,sel.to))pos=findPosH(dir,unit);setCursor(pos.line,pos.ch,true);}
function deleteH(dir,unit){if(!posEq(sel.from,sel.to))replaceRange("",sel.from,sel.to);else if(dir<0)replaceRange("",findPosH(dir,unit),sel.to);else replaceRange("",sel.from,findPosH(dir,unit));userSelChange=true;}
var goalColumn=null;function moveV(dir,unit){var dist=0,pos=localCoords(sel.inverted?sel.from:sel.to,true);if(goalColumn!=null)pos.x=goalColumn;if(unit=="page")dist=scroller.clientHeight;else if(unit=="line")dist=textHeight();var target=coordsChar(pos.x,pos.y+dist*dir+2);setCursor(target.line,target.ch,true);goalColumn=pos.x;}
function selectWordAt(pos){var line=getLine(pos.line).text;var start=pos.ch,end=pos.ch;while(start>0&&isWordChar(line.charAt(start-1)))--start;while(end<line.length&&isWordChar(line.charAt(end)))++end;setSelectionUser({line:pos.line,ch:start},{line:pos.line,ch:end});}
function selectLine(line){setSelectionUser({line:line,ch:0},{line:line,ch:getLine(line).text.length});}
function indentSelected(mode){if(posEq(sel.from,sel.to))return indentLine(sel.from.line,mode);var e=sel.to.line-(sel.to.ch?0:1);for(var i=sel.from.line;i<=e;++i)indentLine(i,mode);}
function indentLine(n,how){if(!how)how="add";if(how=="smart"){if(!mode.indent)how="prev";else var state=getStateBefore(n);}
var line=getLine(n),curSpace=line.indentation(options.tabSize),curSpaceString=line.text.match(/^\s*/)[0],indentation;if(how=="prev"){if(n)indentation=getLine(n-1).indentation(options.tabSize);else indentation=0;}
else if(how=="smart")indentation=mode.indent(state,line.text.slice(curSpaceString.length),line.text);else if(how=="add")indentation=curSpace+options.indentUnit;else if(how=="subtract")indentation=curSpace-options.indentUnit;indentation=Math.max(0,indentation);var diff=indentation-curSpace;if(!diff){if(sel.from.line!=n&&sel.to.line!=n)return;var indentString=curSpaceString;}
else{var indentString="",pos=0;if(options.indentWithTabs)
for(var i=Math.floor(indentation/options.tabSize);i;--i){pos+=options.tabSize;indentString+="\t";}
while(pos<indentation){++pos;indentString+=" ";}}
replaceRange(indentString,{line:n,ch:0},{line:n,ch:curSpaceString.length});}
function loadMode(){mode=CodeMirror.getMode(options,options.mode);doc.iter(0,doc.size,function(line){line.stateAfter=null;});work=[0];startWorker();}
function gutterChanged(){var visible=options.gutter||options.lineNumbers;gutter.style.display=visible?"":"none";if(visible)gutterDirty=true;else lineDiv.parentNode.style.marginLeft=0;}
function wrappingChanged(from,to){if(options.lineWrapping){wrapper.className+=" CodeMirror-wrap";var perLine=scroller.clientWidth/charWidth()-3;doc.iter(0,doc.size,function(line){if(line.hidden)return;var guess=Math.ceil(line.text.length/perLine)||1;if(guess!=1)updateLineHeight(line,guess);});lineSpace.style.width=code.style.width="";}else{wrapper.className=wrapper.className.replace(" CodeMirror-wrap","");maxWidth=null;maxLine="";doc.iter(0,doc.size,function(line){if(line.height!=1&&!line.hidden)updateLineHeight(line,1);if(line.text.length>maxLine.length)maxLine=line.text;});}
changes.push({from:0,to:doc.size});}
function computeTabText(){for(var str='<span class="cm-tab">',i=0;i<options.tabSize;++i)str+=" ";return str+"</span>";}
function tabsChanged(){tabText=computeTabText();updateDisplay(true);}
function themeChanged(){scroller.className=scroller.className.replace(/\s*cm-s-\w+/g,"")+
options.theme.replace(/(^|\s)\s*/g," cm-s-");}
function TextMarker(){this.set=[];}
TextMarker.prototype.clear=operation(function(){var min=Infinity,max=-Infinity;for(var i=0,e=this.set.length;i<e;++i){var line=this.set[i],mk=line.marked;if(!mk||!line.parent)continue;var lineN=lineNo(line);min=Math.min(min,lineN);max=Math.max(max,lineN);for(var j=0;j<mk.length;++j)
if(mk[j].set==this.set)mk.splice(j--,1);}
if(min!=Infinity)
changes.push({from:min,to:max+1});});TextMarker.prototype.find=function(){var from,to;for(var i=0,e=this.set.length;i<e;++i){var line=this.set[i],mk=line.marked;for(var j=0;j<mk.length;++j){var mark=mk[j];if(mark.set==this.set){if(mark.from!=null||mark.to!=null){var found=lineNo(line);if(found!=null){if(mark.from!=null)from={line:found,ch:mark.from};if(mark.to!=null)to={line:found,ch:mark.to};}}}}}
return{from:from,to:to};};function markText(from,to,className){from=clipPos(from);to=clipPos(to);var tm=new TextMarker();function add(line,from,to,className){getLine(line).addMark(new MarkedText(from,to,className,tm.set));}
if(from.line==to.line)add(from.line,from.ch,to.ch,className);else{add(from.line,from.ch,null,className);for(var i=from.line+1,e=to.line;i<e;++i)
add(i,null,null,className);add(to.line,null,to.ch,className);}
changes.push({from:from.line,to:to.line+1});return tm;}
function setBookmark(pos){pos=clipPos(pos);var bm=new Bookmark(pos.ch);getLine(pos.line).addMark(bm);return bm;}
function addGutterMarker(line,text,className){if(typeof line=="number")line=getLine(clipLine(line));line.gutterMarker={text:text,style:className};gutterDirty=true;return line;}
function removeGutterMarker(line){if(typeof line=="number")line=getLine(clipLine(line));line.gutterMarker=null;gutterDirty=true;}
function changeLine(handle,op){var no=handle,line=handle;if(typeof handle=="number")line=getLine(clipLine(handle));else no=lineNo(handle);if(no==null)return null;if(op(line,no))changes.push({from:no,to:no+1});else return null;return line;}
function setLineClass(handle,className){return changeLine(handle,function(line){if(line.className!=className){line.className=className;return true;}});}
function setLineHidden(handle,hidden){return changeLine(handle,function(line,no){if(line.hidden!=hidden){line.hidden=hidden;updateLineHeight(line,hidden?0:1);if(hidden&&(sel.from.line==no||sel.to.line==no))
setSelection(skipHidden(sel.from,sel.from.line,sel.from.ch),skipHidden(sel.to,sel.to.line,sel.to.ch));return(gutterDirty=true);}});}
function lineInfo(line){if(typeof line=="number"){if(!isLine(line))return null;var n=line;line=getLine(line);if(!line)return null;}
else{var n=lineNo(line);if(n==null)return null;}
var marker=line.gutterMarker;return{line:n,handle:line,text:line.text,markerText:marker&&marker.text,markerClass:marker&&marker.style,lineClass:line.className};}
function stringWidth(str){measure.innerHTML="<pre><span>x</span></pre>";measure.firstChild.firstChild.firstChild.nodeValue=str;return measure.firstChild.firstChild.offsetWidth||10;}
function charFromX(line,x){if(x<=0)return 0;var lineObj=getLine(line),text=lineObj.text;function getX(len){measure.innerHTML="<pre><span>"+lineObj.getHTML(null,null,false,tabText,len)+"</span></pre>";return measure.firstChild.firstChild.offsetWidth;}
var from=0,fromX=0,to=text.length,toX;var estimated=Math.min(to,Math.ceil(x/charWidth()));for(;;){var estX=getX(estimated);if(estX<=x&&estimated<to)estimated=Math.min(to,Math.ceil(estimated*1.2));else{toX=estX;to=estimated;break;}}
if(x>toX)return to;estimated=Math.floor(to*0.8);estX=getX(estimated);if(estX<x){from=estimated;fromX=estX;}
for(;;){if(to-from<=1)return(toX-x>x-fromX)?from:to;var middle=Math.ceil((from+to)/2),middleX=getX(middle);if(middleX>x){to=middle;toX=middleX;}
else{from=middle;fromX=middleX;}}}
var tempId=Math.floor(Math.random()*0xffffff).toString(16);function measureLine(line,ch){var extra="";if(options.lineWrapping){var end=line.text.indexOf(" ",ch+2);extra=htmlEscape(line.text.slice(ch+1,end<0?line.text.length:end+(ie?5:0)));}
measure.innerHTML="<pre>"+line.getHTML(null,null,false,tabText,ch)+'<span id="CodeMirror-temp-'+tempId+'">'+htmlEscape(line.text.charAt(ch)||" ")+"</span>"+
extra+"</pre>";var elt=document.getElementById("CodeMirror-temp-"+tempId);var top=elt.offsetTop,left=elt.offsetLeft;if(ie&&ch&&top==0&&left==0){var backup=document.createElement("span");backup.innerHTML="x";elt.parentNode.insertBefore(backup,elt.nextSibling);top=backup.offsetTop;}
return{top:top,left:left};}
function localCoords(pos,inLineWrap){var x,lh=textHeight(),y=lh*(heightAtLine(doc,pos.line)-(inLineWrap?displayOffset:0));if(pos.ch==0)x=0;else{var sp=measureLine(getLine(pos.line),pos.ch);x=sp.left;if(options.lineWrapping)y+=Math.max(0,sp.top);}
return{x:x,y:y,yBot:y+lh};}
function coordsChar(x,y){if(y<0)y=0;var th=textHeight(),cw=charWidth(),heightPos=displayOffset+Math.floor(y/th);var lineNo=lineAtHeight(doc,heightPos);if(lineNo>=doc.size)return{line:doc.size-1,ch:getLine(doc.size-1).text.length};var lineObj=getLine(lineNo),text=lineObj.text;var tw=options.lineWrapping,innerOff=tw?heightPos-heightAtLine(doc,lineNo):0;if(x<=0&&innerOff==0)return{line:lineNo,ch:0};function getX(len){var sp=measureLine(lineObj,len);if(tw){var off=Math.round(sp.top/th);return Math.max(0,sp.left+(off-innerOff)*scroller.clientWidth);}
return sp.left;}
var from=0,fromX=0,to=text.length,toX;var estimated=Math.min(to,Math.ceil((x+innerOff*scroller.clientWidth*.9)/cw));for(;;){var estX=getX(estimated);if(estX<=x&&estimated<to)estimated=Math.min(to,Math.ceil(estimated*1.2));else{toX=estX;to=estimated;break;}}
if(x>toX)return{line:lineNo,ch:to};estimated=Math.floor(to*0.8);estX=getX(estimated);if(estX<x){from=estimated;fromX=estX;}
for(;;){if(to-from<=1)return{line:lineNo,ch:(toX-x>x-fromX)?from:to};var middle=Math.ceil((from+to)/2),middleX=getX(middle);if(middleX>x){to=middle;toX=middleX;}
else{from=middle;fromX=middleX;}}}
function pageCoords(pos){var local=localCoords(pos,true),off=eltOffset(lineSpace);return{x:off.left+local.x,y:off.top+local.y,yBot:off.top+local.yBot};}
var cachedHeight,cachedHeightFor,measureText;function textHeight(){if(measureText==null){measureText="<pre>";for(var i=0;i<49;++i)measureText+="x<br/>";measureText+="x</pre>";}
var offsetHeight=lineDiv.clientHeight;if(offsetHeight==cachedHeightFor)return cachedHeight;cachedHeightFor=offsetHeight;measure.innerHTML=measureText;cachedHeight=measure.firstChild.offsetHeight/50||1;measure.innerHTML="";return cachedHeight;}
var cachedWidth,cachedWidthFor=0;function charWidth(){if(scroller.clientWidth==cachedWidthFor)return cachedWidth;cachedWidthFor=scroller.clientWidth;return(cachedWidth=stringWidth("x"));}
function paddingTop(){return lineSpace.offsetTop;}
function paddingLeft(){return lineSpace.offsetLeft;}
function posFromMouse(e,liberal){var offW=eltOffset(scroller,true),x,y;try{x=e.clientX;y=e.clientY;}catch(e){return null;}
if(!liberal&&(x-offW.left>scroller.clientWidth||y-offW.top>scroller.clientHeight))
return null;var offL=eltOffset(lineSpace,true);return coordsChar(x-offL.left,y-offL.top);}
function onContextMenu(e){var pos=posFromMouse(e);if(!pos||window.opera)return;if(posEq(sel.from,sel.to)||posLess(pos,sel.from)||!posLess(pos,sel.to))
operation(setCursor)(pos.line,pos.ch);var oldCSS=input.style.cssText;inputDiv.style.position="absolute";input.style.cssText="position: fixed; width: 30px; height: 30px; top: "+(e.clientY-5)+"px; left: "+(e.clientX-5)+"px; z-index: 1000; background: white; "+"border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";leaveInputAlone=true;var val=input.value=getSelection();focusInput();input.select();function rehide(){var newVal=splitLines(input.value).join("\n");if(newVal!=val)operation(replaceSelection)(newVal,"end");inputDiv.style.position="relative";input.style.cssText=oldCSS;leaveInputAlone=false;resetInput(true);slowPoll();}
if(gecko){e_stop(e);var mouseup=connect(window,"mouseup",function(){mouseup();setTimeout(rehide,20);},true);}
else{setTimeout(rehide,50);}}
function restartBlink(){clearInterval(blinker);var on=true;cursor.style.visibility="";blinker=setInterval(function(){cursor.style.visibility=(on=!on)?"":"hidden";},650);}
var matching={"(":")>",")":"(<","[":"]>","]":"[<","{":"}>","}":"{<"};function matchBrackets(autoclear){var head=sel.inverted?sel.from:sel.to,line=getLine(head.line),pos=head.ch-1;var match=(pos>=0&&matching[line.text.charAt(pos)])||matching[line.text.charAt(++pos)];if(!match)return;var ch=match.charAt(0),forward=match.charAt(1)==">",d=forward?1:-1,st=line.styles;for(var off=pos+1,i=0,e=st.length;i<e;i+=2)
if((off-=st[i].length)<=0){var style=st[i+1];break;}
var stack=[line.text.charAt(pos)],re=/[(){}[\]]/;function scan(line,from,to){if(!line.text)return;var st=line.styles,pos=forward?0:line.text.length-1,cur;for(var i=forward?0:st.length-2,e=forward?st.length:-2;i!=e;i+=2*d){var text=st[i];if(st[i+1]!=null&&st[i+1]!=style){pos+=d*text.length;continue;}
for(var j=forward?0:text.length-1,te=forward?text.length:-1;j!=te;j+=d,pos+=d){if(pos>=from&&pos<to&&re.test(cur=text.charAt(j))){var match=matching[cur];if(match.charAt(1)==">"==forward)stack.push(cur);else if(stack.pop()!=match.charAt(0))return{pos:pos,match:false};else if(!stack.length)return{pos:pos,match:true};}}}}
for(var i=head.line,e=forward?Math.min(i+100,doc.size):Math.max(-1,i-100);i!=e;i+=d){var line=getLine(i),first=i==head.line;var found=scan(line,first&&forward?pos+1:0,first&&!forward?pos:line.text.length);if(found)break;}
if(!found)found={pos:null,match:false};var style=found.match?"CodeMirror-matchingbracket":"CodeMirror-nonmatchingbracket";var one=markText({line:head.line,ch:pos},{line:head.line,ch:pos+1},style),two=found.pos!=null&&markText({line:i,ch:found.pos},{line:i,ch:found.pos+1},style);var clear=operation(function(){one.clear();two&&two.clear();});if(autoclear)setTimeout(clear,800);else bracketHighlighted=clear;}
function findStartLine(n){var minindent,minline;for(var search=n,lim=n-40;search>lim;--search){if(search==0)return 0;var line=getLine(search-1);if(line.stateAfter)return search;var indented=line.indentation(options.tabSize);if(minline==null||minindent>indented){minline=search-1;minindent=indented;}}
return minline;}
function getStateBefore(n){var start=findStartLine(n),state=start&&getLine(start-1).stateAfter;if(!state)state=startState(mode);else state=copyState(mode,state);doc.iter(start,n,function(line){line.highlight(mode,state,options.tabSize);line.stateAfter=copyState(mode,state);});if(start<n)changes.push({from:start,to:n});if(n<doc.size&&!getLine(n).stateAfter)work.push(n);return state;}
function highlightLines(start,end){var state=getStateBefore(start);doc.iter(start,end,function(line){line.highlight(mode,state,options.tabSize);line.stateAfter=copyState(mode,state);});}
function highlightWorker(){var end=+new Date+options.workTime;var foundWork=work.length;while(work.length){if(!getLine(showingFrom).stateAfter)var task=showingFrom;else var task=work.pop();if(task>=doc.size)continue;var start=findStartLine(task),state=start&&getLine(start-1).stateAfter;if(state)state=copyState(mode,state);else state=startState(mode);var unchanged=0,compare=mode.compareStates,realChange=false,i=start,bail=false;doc.iter(i,doc.size,function(line){var hadState=line.stateAfter;if(+new Date>end){work.push(i);startWorker(options.workDelay);if(realChange)changes.push({from:task,to:i+1});return(bail=true);}
var changed=line.highlight(mode,state,options.tabSize);if(changed)realChange=true;line.stateAfter=copyState(mode,state);if(compare){if(hadState&&compare(hadState,state))return true;}else{if(changed!==false||!hadState)unchanged=0;else if(++unchanged>3&&(!mode.indent||mode.indent(hadState,"")==mode.indent(state,"")))
return true;}
++i;});if(bail)return;if(realChange)changes.push({from:task,to:i+1});}
if(foundWork&&options.onHighlightComplete)
options.onHighlightComplete(instance);}
function startWorker(time){if(!work.length)return;highlight.set(time,operation(highlightWorker));}
function startOperation(){updateInput=userSelChange=textChanged=null;changes=[];selectionChanged=false;callbacks=[];}
function endOperation(){var reScroll=false,updated;if(selectionChanged)reScroll=!scrollCursorIntoView();if(changes.length)updated=updateDisplay(changes,true);else{if(selectionChanged)updateCursor();if(gutterDirty)updateGutter();}
if(reScroll)scrollCursorIntoView();if(selectionChanged){scrollEditorIntoView();restartBlink();}
if(focused&&!leaveInputAlone&&(updateInput===true||(updateInput!==false&&selectionChanged)))
resetInput(userSelChange);if(selectionChanged&&options.matchBrackets)
setTimeout(operation(function(){if(bracketHighlighted){bracketHighlighted();bracketHighlighted=null;}
if(posEq(sel.from,sel.to))matchBrackets(false);}),20);var tc=textChanged,cbs=callbacks;if(selectionChanged&&options.onCursorActivity)
options.onCursorActivity(instance);if(tc&&options.onChange&&instance)
options.onChange(instance,tc);for(var i=0;i<cbs.length;++i)cbs[i](instance);if(updated&&options.onUpdate)options.onUpdate(instance);}
var nestedOperation=0;function operation(f){return function(){if(!nestedOperation++)startOperation();try{var result=f.apply(this,arguments);}
finally{if(!--nestedOperation)endOperation();}
return result;};}
for(var ext in extensions)
if(extensions.propertyIsEnumerable(ext)&&!instance.propertyIsEnumerable(ext))
instance[ext]=extensions[ext];return instance;}
CodeMirror.defaults={value:"",mode:null,theme:"default",indentUnit:2,indentWithTabs:false,tabSize:4,keyMap:"default",extraKeys:null,electricChars:true,onKeyEvent:null,lineWrapping:false,lineNumbers:false,gutter:false,fixedGutter:false,firstLineNumber:1,readOnly:false,onChange:null,onCursorActivity:null,onGutterClick:null,onHighlightComplete:null,onUpdate:null,onFocus:null,onBlur:null,onScroll:null,matchBrackets:false,workTime:100,workDelay:200,pollInterval:100,undoDepth:40,tabindex:null,document:window.document};var mac=/Mac/.test(navigator.platform);var win=/Win/.test(navigator.platform);var modes={},mimeModes={};CodeMirror.defineMode=function(name,mode){if(!CodeMirror.defaults.mode&&name!="null")CodeMirror.defaults.mode=name;modes[name]=mode;};CodeMirror.defineMIME=function(mime,spec){mimeModes[mime]=spec;};CodeMirror.getMode=function(options,spec){if(typeof spec=="string"&&mimeModes.hasOwnProperty(spec))
spec=mimeModes[spec];if(typeof spec=="string")
var mname=spec,config={};else if(spec!=null)
var mname=spec.name,config=spec;var mfactory=modes[mname];if(!mfactory){if(window.console)console.warn("No mode "+mname+" found, falling back to plain text.");return CodeMirror.getMode(options,"text/plain");}
return mfactory(options,config||{});};CodeMirror.listModes=function(){var list=[];for(var m in modes)
if(modes.propertyIsEnumerable(m))list.push(m);return list;};CodeMirror.listMIMEs=function(){var list=[];for(var m in mimeModes)
if(mimeModes.propertyIsEnumerable(m))list.push({mime:m,mode:mimeModes[m]});return list;};var extensions=CodeMirror.extensions={};CodeMirror.defineExtension=function(name,func){extensions[name]=func;};var commands=CodeMirror.commands={selectAll:function(cm){cm.setSelection({line:0,ch:0},{line:cm.lineCount()-1});},killLine:function(cm){var from=cm.getCursor(true),to=cm.getCursor(false),sel=!posEq(from,to);if(!sel&&cm.getLine(from.line).length==from.ch)cm.replaceRange("",from,{line:from.line+1,ch:0});else cm.replaceRange("",from,sel?to:{line:from.line});},deleteLine:function(cm){var l=cm.getCursor().line;cm.replaceRange("",{line:l,ch:0},{line:l});},undo:function(cm){cm.undo();},redo:function(cm){cm.redo();},goDocStart:function(cm){cm.setCursor(0,0,true);},goDocEnd:function(cm){cm.setSelection({line:cm.lineCount()-1},null,true);},goLineStart:function(cm){cm.setCursor(cm.getCursor().line,0,true);},goLineStartSmart:function(cm){var cur=cm.getCursor();var text=cm.getLine(cur.line),firstNonWS=Math.max(0,text.search(/\S/));cm.setCursor(cur.line,cur.ch<=firstNonWS&&cur.ch?0:firstNonWS,true);},goLineEnd:function(cm){cm.setSelection({line:cm.getCursor().line},null,true);},goLineUp:function(cm){cm.moveV(-1,"line");},goLineDown:function(cm){cm.moveV(1,"line");},goPageUp:function(cm){cm.moveV(-1,"page");},goPageDown:function(cm){cm.moveV(1,"page");},goCharLeft:function(cm){cm.moveH(-1,"char");},goCharRight:function(cm){cm.moveH(1,"char");},goColumnLeft:function(cm){cm.moveH(-1,"column");},goColumnRight:function(cm){cm.moveH(1,"column");},goWordLeft:function(cm){cm.moveH(-1,"word");},goWordRight:function(cm){cm.moveH(1,"word");},delCharLeft:function(cm){cm.deleteH(-1,"char");},delCharRight:function(cm){cm.deleteH(1,"char");},delWordLeft:function(cm){cm.deleteH(-1,"word");},delWordRight:function(cm){cm.deleteH(1,"word");},indentAuto:function(cm){cm.indentSelection("smart");},indentMore:function(cm){cm.indentSelection("add");},indentLess:function(cm){cm.indentSelection("subtract");},insertTab:function(cm){cm.replaceSelection("\t","end");},transposeChars:function(cm){var cur=cm.getCursor(),line=cm.getLine(cur.line);if(cur.ch>0&&cur.ch<line.length-1)
cm.replaceRange(line.charAt(cur.ch)+line.charAt(cur.ch-1),{line:cur.line,ch:cur.ch-1},{line:cur.line,ch:cur.ch+1});},newlineAndIndent:function(cm){cm.replaceSelection("\n","end");cm.indentLine(cm.getCursor().line);},toggleOverwrite:function(cm){cm.toggleOverwrite();}};var keyMap=CodeMirror.keyMap={};keyMap.basic={"Left":"goCharLeft","Right":"goCharRight","Up":"goLineUp","Down":"goLineDown","End":"goLineEnd","Home":"goLineStartSmart","PageUp":"goPageUp","PageDown":"goPageDown","Delete":"delCharRight","Backspace":"delCharLeft","Tab":"indentMore","Shift-Tab":"indentLess","Enter":"newlineAndIndent","Insert":"toggleOverwrite"};keyMap.pcDefault={"Ctrl-A":"selectAll","Ctrl-D":"deleteLine","Ctrl-Z":"undo","Shift-Ctrl-Z":"redo","Ctrl-Y":"redo","Ctrl-Home":"goDocStart","Alt-Up":"goDocStart","Ctrl-End":"goDocEnd","Ctrl-Down":"goDocEnd","Ctrl-Left":"goWordLeft","Ctrl-Right":"goWordRight","Alt-Left":"goLineStart","Alt-Right":"goLineEnd","Ctrl-Backspace":"delWordLeft","Ctrl-Delete":"delWordRight","Ctrl-S":"save","Ctrl-F":"find","Ctrl-G":"findNext","Shift-Ctrl-G":"findPrev","Shift-Ctrl-F":"replace","Shift-Ctrl-R":"replaceAll",fallthrough:"basic"};keyMap.macDefault={"Cmd-A":"selectAll","Cmd-D":"deleteLine","Cmd-Z":"undo","Shift-Cmd-Z":"redo","Cmd-Y":"redo","Cmd-Up":"goDocStart","Cmd-End":"goDocEnd","Cmd-Down":"goDocEnd","Alt-Left":"goWordLeft","Alt-Right":"goWordRight","Cmd-Left":"goLineStart","Cmd-Right":"goLineEnd","Alt-Backspace":"delWordLeft","Ctrl-Alt-Backspace":"delWordRight","Alt-Delete":"delWordRight","Cmd-S":"save","Cmd-F":"find","Cmd-G":"findNext","Shift-Cmd-G":"findPrev","Cmd-Alt-F":"replace","Shift-Cmd-Alt-F":"replaceAll",fallthrough:"basic"};keyMap["default"]=mac?keyMap.macDefault:keyMap.pcDefault;function lookupKey(name,extraMap,map){function lookup(name,map,ft){var found=map[name];if(found!=null)return found;if(ft==null)ft=map.fallthrough;if(ft==null)return map.catchall;if(typeof ft=="string")return lookup(name,keyMap[ft]);for(var i=0,e=ft.length;i<e;++i){found=lookup(name,keyMap[ft[i]]);if(found!=null)return found;}
return null;}
return extraMap?lookup(name,extraMap,map):lookup(name,keyMap[map]);}
function isModifierKey(event){var name=keyNames[event.keyCode];return name=="Ctrl"||name=="Alt"||name=="Shift"||name=="Mod";}
CodeMirror.fromTextArea=function(textarea,options){if(!options)options={};options.value=textarea.value;if(!options.tabindex&&textarea.tabindex)
options.tabindex=textarea.tabindex;function save(){textarea.value=instance.getValue();}
if(textarea.form){var rmSubmit=connect(textarea.form,"submit",save,true);if(typeof textarea.form.submit=="function"){var realSubmit=textarea.form.submit;function wrappedSubmit(){save();textarea.form.submit=realSubmit;textarea.form.submit();textarea.form.submit=wrappedSubmit;}
textarea.form.submit=wrappedSubmit;}}
textarea.style.display="none";var instance=CodeMirror(function(node){textarea.parentNode.insertBefore(node,textarea.nextSibling);},options);instance.save=save;instance.getTextArea=function(){return textarea;};instance.toTextArea=function(){save();textarea.parentNode.removeChild(instance.getWrapperElement());textarea.style.display="";if(textarea.form){rmSubmit();if(typeof textarea.form.submit=="function")
textarea.form.submit=realSubmit;}};return instance;};function copyState(mode,state){if(state===true)return state;if(mode.copyState)return mode.copyState(state);var nstate={};for(var n in state){var val=state[n];if(val instanceof Array)val=val.concat([]);nstate[n]=val;}
return nstate;}
CodeMirror.copyState=copyState;function startState(mode,a1,a2){return mode.startState?mode.startState(a1,a2):true;}
CodeMirror.startState=startState;function StringStream(string,tabSize){this.pos=this.start=0;this.string=string;this.tabSize=tabSize||8;}
StringStream.prototype={eol:function(){return this.pos>=this.string.length;},sol:function(){return this.pos==0;},peek:function(){return this.string.charAt(this.pos);},next:function(){if(this.pos<this.string.length)
return this.string.charAt(this.pos++);},eat:function(match){var ch=this.string.charAt(this.pos);if(typeof match=="string")var ok=ch==match;else var ok=ch&&(match.test?match.test(ch):match(ch));if(ok){++this.pos;return ch;}},eatWhile:function(match){var start=this.pos;while(this.eat(match)){}
return this.pos>start;},eatSpace:function(){var start=this.pos;while(/[\s\u00a0]/.test(this.string.charAt(this.pos)))++this.pos;return this.pos>start;},skipToEnd:function(){this.pos=this.string.length;},skipTo:function(ch){var found=this.string.indexOf(ch,this.pos);if(found>-1){this.pos=found;return true;}},backUp:function(n){this.pos-=n;},column:function(){return countColumn(this.string,this.start,this.tabSize);},indentation:function(){return countColumn(this.string,null,this.tabSize);},match:function(pattern,consume,caseInsensitive){if(typeof pattern=="string"){function cased(str){return caseInsensitive?str.toLowerCase():str;}
if(cased(this.string).indexOf(cased(pattern),this.pos)==this.pos){if(consume!==false)this.pos+=pattern.length;return true;}}
else{var match=this.string.slice(this.pos).match(pattern);if(match&&consume!==false)this.pos+=match[0].length;return match;}},current:function(){return this.string.slice(this.start,this.pos);}};CodeMirror.StringStream=StringStream;function MarkedText(from,to,className,set){this.from=from;this.to=to;this.style=className;this.set=set;}
MarkedText.prototype={attach:function(line){this.set.push(line);},detach:function(line){var ix=indexOf(this.set,line);if(ix>-1)this.set.splice(ix,1);},split:function(pos,lenBefore){if(this.to<=pos&&this.to!=null)return null;var from=this.from<pos||this.from==null?null:this.from-pos+lenBefore;var to=this.to==null?null:this.to-pos+lenBefore;return new MarkedText(from,to,this.style,this.set);},dup:function(){return new MarkedText(null,null,this.style,this.set);},clipTo:function(fromOpen,from,toOpen,to,diff){if(this.from!=null&&this.from>=from)
this.from=Math.max(to,this.from)+diff;if(this.to!=null&&this.to>from)
this.to=to<this.to?this.to+diff:from;if(fromOpen&&to>this.from&&(to<this.to||this.to==null))
this.from=null;if(toOpen&&(from<this.to||this.to==null)&&(from>this.from||this.from==null))
this.to=null;},isDead:function(){return this.from!=null&&this.to!=null&&this.from>=this.to;},sameSet:function(x){return this.set==x.set;}};function Bookmark(pos){this.from=pos;this.to=pos;this.line=null;}
Bookmark.prototype={attach:function(line){this.line=line;},detach:function(line){if(this.line==line)this.line=null;},split:function(pos,lenBefore){if(pos<this.from){this.from=this.to=(this.from-pos)+lenBefore;return this;}},isDead:function(){return this.from>this.to;},clipTo:function(fromOpen,from,toOpen,to,diff){if((fromOpen||from<this.from)&&(toOpen||to>this.to)){this.from=0;this.to=-1;}else if(this.from>from){this.from=this.to=Math.max(to,this.from)+diff;}},sameSet:function(x){return false;},find:function(){if(!this.line||!this.line.parent)return null;return{line:lineNo(this.line),ch:this.from};},clear:function(){if(this.line){var found=indexOf(this.line.marked,this);if(found!=-1)this.line.marked.splice(found,1);this.line=null;}}};function Line(text,styles){this.styles=styles||[text,null];this.text=text;this.height=1;this.marked=this.gutterMarker=this.className=this.handlers=null;this.stateAfter=this.parent=this.hidden=null;}
Line.inheritMarks=function(text,orig){var ln=new Line(text),mk=orig&&orig.marked;if(mk){for(var i=0;i<mk.length;++i){if(mk[i].to==null&&mk[i].style){var newmk=ln.marked||(ln.marked=[]),mark=mk[i];var nmark=mark.dup();newmk.push(nmark);nmark.attach(ln);}}}
return ln;}
Line.prototype={replace:function(from,to_,text){var st=[],mk=this.marked,to=to_==null?this.text.length:to_;copyStyles(0,from,this.styles,st);if(text)st.push(text,null);copyStyles(to,this.text.length,this.styles,st);this.styles=st;this.text=this.text.slice(0,from)+text+this.text.slice(to);this.stateAfter=null;if(mk){var diff=text.length-(to-from);for(var i=0,mark=mk[i];i<mk.length;++i){mark.clipTo(from==null,from||0,to_==null,to,diff);if(mark.isDead()){mark.detach(this);mk.splice(i--,1);}}}},split:function(pos,textBefore){var st=[textBefore,null],mk=this.marked;copyStyles(pos,this.text.length,this.styles,st);var taken=new Line(textBefore+this.text.slice(pos),st);if(mk){for(var i=0;i<mk.length;++i){var mark=mk[i];var newmark=mark.split(pos,textBefore.length);if(newmark){if(!taken.marked)taken.marked=[];taken.marked.push(newmark);newmark.attach(taken);}}}
return taken;},append:function(line){var mylen=this.text.length,mk=line.marked,mymk=this.marked;this.text+=line.text;copyStyles(0,line.text.length,line.styles,this.styles);if(mymk){for(var i=0;i<mymk.length;++i)
if(mymk[i].to==null)mymk[i].to=mylen;}
if(mk&&mk.length){if(!mymk)this.marked=mymk=[];outer:for(var i=0;i<mk.length;++i){var mark=mk[i];if(!mark.from){for(var j=0;j<mymk.length;++j){var mymark=mymk[j];if(mymark.to==mylen&&mymark.sameSet(mark)){mymark.to=mark.to==null?null:mark.to+mylen;if(mymark.isDead()){mymark.detach(this);mk.splice(i--,1);}
continue outer;}}}
mymk.push(mark);mark.attach(this);mark.from+=mylen;if(mark.to!=null)mark.to+=mylen;}}},fixMarkEnds:function(other){var mk=this.marked,omk=other.marked;if(!mk)return;for(var i=0;i<mk.length;++i){var mark=mk[i],close=mark.to==null;if(close&&omk){for(var j=0;j<omk.length;++j)
if(omk[j].sameSet(mark)){close=false;break;}}
if(close)mark.to=this.text.length;}},fixMarkStarts:function(){var mk=this.marked;if(!mk)return;for(var i=0;i<mk.length;++i)
if(mk[i].from==null)mk[i].from=0;},addMark:function(mark){mark.attach(this);if(this.marked==null)this.marked=[];this.marked.push(mark);this.marked.sort(function(a,b){return(a.from||0)-(b.from||0);});},highlight:function(mode,state,tabSize){var stream=new StringStream(this.text,tabSize),st=this.styles,pos=0;var changed=false,curWord=st[0],prevWord;if(this.text==""&&mode.blankLine)mode.blankLine(state);while(!stream.eol()){var style=mode.token(stream,state);var substr=this.text.slice(stream.start,stream.pos);stream.start=stream.pos;if(pos&&st[pos-1]==style)
st[pos-2]+=substr;else if(substr){if(!changed&&(st[pos+1]!=style||(pos&&st[pos-2]!=prevWord)))changed=true;st[pos++]=substr;st[pos++]=style;prevWord=curWord;curWord=st[pos];}
if(stream.pos>5000){st[pos++]=this.text.slice(stream.pos);st[pos++]=null;break;}}
if(st.length!=pos){st.length=pos;changed=true;}
if(pos&&st[pos-2]!=prevWord)changed=true;return changed||(st.length<5&&this.text.length<10?null:false);},getTokenAt:function(mode,state,ch){var txt=this.text,stream=new StringStream(txt);while(stream.pos<ch&&!stream.eol()){stream.start=stream.pos;var style=mode.token(stream,state);}
return{start:stream.start,end:stream.pos,string:stream.current(),className:style||null,state:state};},indentation:function(tabSize){return countColumn(this.text,null,tabSize);},getHTML:function(sfrom,sto,includePre,tabText,endAt){var html=[],first=true;if(includePre)
html.push(this.className?'<pre class="'+this.className+'">':"<pre>");function span(text,style){if(!text)return;if(first&&ie&&text.charAt(0)==" ")text="\u00a0"+text.slice(1);first=false;if(style)html.push('<span class="',style,'">',htmlEscape(text).replace(/\t/g,tabText),"</span>");else html.push(htmlEscape(text).replace(/\t/g,tabText));}
var st=this.styles,allText=this.text,marked=this.marked;if(sfrom==sto)sfrom=null;var len=allText.length;if(endAt!=null)len=Math.min(endAt,len);if(!allText&&endAt==null)
span(" ",sfrom!=null&&sto==null?"CodeMirror-selected":null);else if(!marked&&sfrom==null)
for(var i=0,ch=0;ch<len;i+=2){var str=st[i],style=st[i+1],l=str.length;if(ch+l>len)str=str.slice(0,len-ch);ch+=l;span(str,style&&"cm-"+style);}
else{var pos=0,i=0,text="",style,sg=0;var markpos=-1,mark=null;function nextMark(){if(marked){markpos+=1;mark=(markpos<marked.length)?marked[markpos]:null;}}
nextMark();while(pos<len){var upto=len;var extraStyle="";if(sfrom!=null){if(sfrom>pos)upto=sfrom;else if(sto==null||sto>pos){extraStyle=" CodeMirror-selected";if(sto!=null)upto=Math.min(upto,sto);}}
while(mark&&mark.to!=null&&mark.to<=pos)nextMark();if(mark){if(mark.from>pos)upto=Math.min(upto,mark.from);else{extraStyle+=" "+mark.style;if(mark.to!=null)upto=Math.min(upto,mark.to);}}
for(;;){var end=pos+text.length;var appliedStyle=style;if(extraStyle)appliedStyle=style?style+extraStyle:extraStyle;span(end>upto?text.slice(0,upto-pos):text,appliedStyle);if(end>=upto){text=text.slice(upto-pos);pos=upto;break;}
pos=end;text=st[i++];style="cm-"+st[i++];}}
if(sfrom!=null&&sto==null)span(" ","CodeMirror-selected");}
if(includePre)html.push("</pre>");return html.join("");},cleanUp:function(){this.parent=null;if(this.marked)
for(var i=0,e=this.marked.length;i<e;++i)this.marked[i].detach(this);}};function copyStyles(from,to,source,dest){for(var i=0,pos=0,state=0;pos<to;i+=2){var part=source[i],end=pos+part.length;if(state==0){if(end>from)dest.push(part.slice(from-pos,Math.min(part.length,to-pos)),source[i+1]);if(end>=from)state=1;}
else if(state==1){if(end>to)dest.push(part.slice(0,to-pos),source[i+1]);else dest.push(part,source[i+1]);}
pos=end;}}
function LeafChunk(lines){this.lines=lines;this.parent=null;for(var i=0,e=lines.length,height=0;i<e;++i){lines[i].parent=this;height+=lines[i].height;}
this.height=height;}
LeafChunk.prototype={chunkSize:function(){return this.lines.length;},remove:function(at,n,callbacks){for(var i=at,e=at+n;i<e;++i){var line=this.lines[i];this.height-=line.height;line.cleanUp();if(line.handlers)
for(var j=0;j<line.handlers.length;++j)callbacks.push(line.handlers[j]);}
this.lines.splice(at,n);},collapse:function(lines){lines.splice.apply(lines,[lines.length,0].concat(this.lines));},insertHeight:function(at,lines,height){this.height+=height;this.lines.splice.apply(this.lines,[at,0].concat(lines));for(var i=0,e=lines.length;i<e;++i)lines[i].parent=this;},iterN:function(at,n,op){for(var e=at+n;at<e;++at)
if(op(this.lines[at]))return true;}};function BranchChunk(children){this.children=children;var size=0,height=0;for(var i=0,e=children.length;i<e;++i){var ch=children[i];size+=ch.chunkSize();height+=ch.height;ch.parent=this;}
this.size=size;this.height=height;this.parent=null;}
BranchChunk.prototype={chunkSize:function(){return this.size;},remove:function(at,n,callbacks){this.size-=n;for(var i=0;i<this.children.length;++i){var child=this.children[i],sz=child.chunkSize();if(at<sz){var rm=Math.min(n,sz-at),oldHeight=child.height;child.remove(at,rm,callbacks);this.height-=oldHeight-child.height;if(sz==rm){this.children.splice(i--,1);child.parent=null;}
if((n-=rm)==0)break;at=0;}else at-=sz;}
if(this.size-n<25){var lines=[];this.collapse(lines);this.children=[new LeafChunk(lines)];}},collapse:function(lines){for(var i=0,e=this.children.length;i<e;++i)this.children[i].collapse(lines);},insert:function(at,lines){var height=0;for(var i=0,e=lines.length;i<e;++i)height+=lines[i].height;this.insertHeight(at,lines,height);},insertHeight:function(at,lines,height){this.size+=lines.length;this.height+=height;for(var i=0,e=this.children.length;i<e;++i){var child=this.children[i],sz=child.chunkSize();if(at<=sz){child.insertHeight(at,lines,height);if(child.lines&&child.lines.length>50){while(child.lines.length>50){var spilled=child.lines.splice(child.lines.length-25,25);var newleaf=new LeafChunk(spilled);child.height-=newleaf.height;this.children.splice(i+1,0,newleaf);newleaf.parent=this;}
this.maybeSpill();}
break;}
at-=sz;}},maybeSpill:function(){if(this.children.length<=10)return;var me=this;do{var spilled=me.children.splice(me.children.length-5,5);var sibling=new BranchChunk(spilled);if(!me.parent){var copy=new BranchChunk(me.children);copy.parent=me;me.children=[copy,sibling];me=copy;}else{me.size-=sibling.size;me.height-=sibling.height;var myIndex=indexOf(me.parent.children,me);me.parent.children.splice(myIndex+1,0,sibling);}
sibling.parent=me.parent;}while(me.children.length>10);me.parent.maybeSpill();},iter:function(from,to,op){this.iterN(from,to-from,op);},iterN:function(at,n,op){for(var i=0,e=this.children.length;i<e;++i){var child=this.children[i],sz=child.chunkSize();if(at<sz){var used=Math.min(n,sz-at);if(child.iterN(at,used,op))return true;if((n-=used)==0)break;at=0;}else at-=sz;}}};function getLineAt(chunk,n){while(!chunk.lines){for(var i=0;;++i){var child=chunk.children[i],sz=child.chunkSize();if(n<sz){chunk=child;break;}
n-=sz;}}
return chunk.lines[n];}
function lineNo(line){if(line.parent==null)return null;var cur=line.parent,no=indexOf(cur.lines,line);for(var chunk=cur.parent;chunk;cur=chunk,chunk=chunk.parent){for(var i=0,e=chunk.children.length;;++i){if(chunk.children[i]==cur)break;no+=chunk.children[i].chunkSize();}}
return no;}
function lineAtHeight(chunk,h){var n=0;outer:do{for(var i=0,e=chunk.children.length;i<e;++i){var child=chunk.children[i],ch=child.height;if(h<ch){chunk=child;continue outer;}
h-=ch;n+=child.chunkSize();}
return n;}while(!chunk.lines);for(var i=0,e=chunk.lines.length;i<e;++i){var line=chunk.lines[i],lh=line.height;if(h<lh)break;h-=lh;}
return n+i;}
function heightAtLine(chunk,n){var h=0;outer:do{for(var i=0,e=chunk.children.length;i<e;++i){var child=chunk.children[i],sz=child.chunkSize();if(n<sz){chunk=child;continue outer;}
n-=sz;h+=child.height;}
return h;}while(!chunk.lines);for(var i=0;i<n;++i)h+=chunk.lines[i].height;return h;}
function History(){this.time=0;this.done=[];this.undone=[];}
History.prototype={addChange:function(start,added,old){this.undone.length=0;var time=+new Date,last=this.done[this.done.length-1];if(time-this.time>400||!last||last.start>start+added||last.start+last.added<start-last.added+last.old.length)
this.done.push({start:start,added:added,old:old});else{var oldoff=0;if(start<last.start){for(var i=last.start-start-1;i>=0;--i)
last.old.unshift(old[i]);last.added+=last.start-start;last.start=start;}
else if(last.start<start){oldoff=start-last.start;added+=oldoff;}
for(var i=last.added-oldoff,e=old.length;i<e;++i)
last.old.push(old[i]);if(last.added<added)last.added=added;}
this.time=time;}};function stopMethod(){e_stop(this);}
function addStop(event){if(!event.stop)event.stop=stopMethod;return event;}
function e_preventDefault(e){if(e.preventDefault)e.preventDefault();else e.returnValue=false;}
function e_stopPropagation(e){if(e.stopPropagation)e.stopPropagation();else e.cancelBubble=true;}
function e_stop(e){e_preventDefault(e);e_stopPropagation(e);}
CodeMirror.e_stop=e_stop;CodeMirror.e_preventDefault=e_preventDefault;CodeMirror.e_stopPropagation=e_stopPropagation;function e_target(e){return e.target||e.srcElement;}
function e_button(e){if(e.which)return e.which;else if(e.button&1)return 1;else if(e.button&2)return 3;else if(e.button&4)return 2;}
function connect(node,type,handler,disconnect){if(typeof node.addEventListener=="function"){node.addEventListener(type,handler,false);if(disconnect)return function(){node.removeEventListener(type,handler,false);};}
else{var wrapHandler=function(event){handler(event||window.event);};node.attachEvent("on"+type,wrapHandler);if(disconnect)return function(){node.detachEvent("on"+type,wrapHandler);};}}
CodeMirror.connect=connect;function Delayed(){this.id=null;}
Delayed.prototype={set:function(ms,f){clearTimeout(this.id);this.id=setTimeout(f,ms);}};var dragAndDrop=function(){if(/MSIE [1-8]\b/.test(navigator.userAgent))return false;var div=document.createElement('div');return"draggable"in div;}();var gecko=/gecko\/\d{7}/i.test(navigator.userAgent);var ie=/MSIE \d/.test(navigator.userAgent);var webkit=/WebKit\//.test(navigator.userAgent);var lineSep="\n";(function(){var te=document.createElement("textarea");te.value="foo\nbar";if(te.value.indexOf("\r")>-1)lineSep="\r\n";}());function countColumn(string,end,tabSize){if(end==null){end=string.search(/[^\s\u00a0]/);if(end==-1)end=string.length;}
for(var i=0,n=0;i<end;++i){if(string.charAt(i)=="\t")n+=tabSize-(n%tabSize);else++n;}
return n;}
function computedStyle(elt){if(elt.currentStyle)return elt.currentStyle;return window.getComputedStyle(elt,null);}
function eltOffset(node,screen){var bod=node.ownerDocument.body;var x=0,y=0,skipBody=false;for(var n=node;n;n=n.offsetParent){var ol=n.offsetLeft,ot=n.offsetTop;if(n==bod){x+=Math.abs(ol);y+=Math.abs(ot);}
else{x+=ol,y+=ot;}
if(screen&&computedStyle(n).position=="fixed")
skipBody=true;}
var e=screen&&!skipBody?null:bod;for(var n=node.parentNode;n!=e;n=n.parentNode)
if(n.scrollLeft!=null){x-=n.scrollLeft;y-=n.scrollTop;}
return{left:x,top:y};}
if(document.documentElement.getBoundingClientRect!=null)eltOffset=function(node,screen){try{var box=node.getBoundingClientRect();box={top:box.top,left:box.left};}
catch(e){box={top:0,left:0};}
if(!screen){if(window.pageYOffset==null){var t=document.documentElement||document.body.parentNode;if(t.scrollTop==null)t=document.body;box.top+=t.scrollTop;box.left+=t.scrollLeft;}else{box.top+=window.pageYOffset;box.left+=window.pageXOffset;}}
return box;};function eltText(node){return node.textContent||node.innerText||node.nodeValue||"";}
function posEq(a,b){return a.line==b.line&&a.ch==b.ch;}
function posLess(a,b){return a.line<b.line||(a.line==b.line&&a.ch<b.ch);}
function copyPos(x){return{line:x.line,ch:x.ch};}
var escapeElement=document.createElement("pre");function htmlEscape(str){escapeElement.textContent=str;return escapeElement.innerHTML;}
if(htmlEscape("a")=="\na")
htmlEscape=function(str){escapeElement.textContent=str;return escapeElement.innerHTML.slice(1);};else if(htmlEscape("\t")!="\t")
htmlEscape=function(str){escapeElement.innerHTML="";escapeElement.appendChild(document.createTextNode(str));return escapeElement.innerHTML;};CodeMirror.htmlEscape=htmlEscape;function editEnd(from,to){if(!to)return from?from.length:0;if(!from)return to.length;for(var i=from.length,j=to.length;i>=0&&j>=0;--i,--j)
if(from.charAt(i)!=to.charAt(j))break;return j+1;}
function indexOf(collection,elt){if(collection.indexOf)return collection.indexOf(elt);for(var i=0,e=collection.length;i<e;++i)
if(collection[i]==elt)return i;return-1;}
function isWordChar(ch){return/\w/.test(ch)||ch.toUpperCase()!=ch.toLowerCase();}
var splitLines="\n\nb".split(/\n/).length!=3?function(string){var pos=0,nl,result=[];while((nl=string.indexOf("\n",pos))>-1){result.push(string.slice(pos,string.charAt(nl-1)=="\r"?nl-1:nl));pos=nl+1;}
result.push(string.slice(pos));return result;}:function(string){return string.split(/\r?\n/);};CodeMirror.splitLines=splitLines;var hasSelection=window.getSelection?function(te){try{return te.selectionStart!=te.selectionEnd;}
catch(e){return false;}}:function(te){try{var range=te.ownerDocument.selection.createRange();}
catch(e){}
if(!range||range.parentElement()!=te)return false;return range.compareEndPoints("StartToEnd",range)!=0;};CodeMirror.defineMode("null",function(){return{token:function(stream){stream.skipToEnd();}};});CodeMirror.defineMIME("text/plain","null");var keyNames={3:"Enter",8:"Backspace",9:"Tab",13:"Enter",16:"Shift",17:"Ctrl",18:"Alt",19:"Pause",20:"CapsLock",27:"Esc",32:"Space",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",40:"Down",44:"PrintScrn",45:"Insert",46:"Delete",59:";",91:"Mod",92:"Mod",93:"Mod",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'",63276:"PageUp",63277:"PageDown",63275:"End",63273:"Home",63234:"Left",63232:"Up",63235:"Right",63233:"Down",63302:"Insert",63272:"Delete"};CodeMirror.keyNames=keyNames;(function(){for(var i=0;i<10;i++)keyNames[i+48]=String(i);for(var i=65;i<=90;i++)keyNames[i]=String.fromCharCode(i);for(var i=1;i<=12;i++)keyNames[i+111]=keyNames[i+63235]="F"+i;})();return CodeMirror;})();(function(){function SearchCursor(cm,query,pos,caseFold){this.atOccurrence=false;this.cm=cm;if(caseFold==null)caseFold=typeof query=="string"&&query==query.toLowerCase();pos=pos?cm.clipPos(pos):{line:0,ch:0};this.pos={from:pos,to:pos};if(typeof query!="string")
this.matches=function(reverse,pos){if(reverse){var line=cm.getLine(pos.line).slice(0,pos.ch),match=line.match(query),start=0;while(match){var ind=line.indexOf(match[0]);start+=ind;line=line.slice(ind+1);var newmatch=line.match(query);if(newmatch)match=newmatch;else break;start++;}}
else{var line=cm.getLine(pos.line).slice(pos.ch),match=line.match(query),start=match&&pos.ch+line.indexOf(match[0]);}
if(match)
return{from:{line:pos.line,ch:start},to:{line:pos.line,ch:start+match[0].length},match:match};};else{if(caseFold)query=query.toLowerCase();var fold=caseFold?function(str){return str.toLowerCase();}:function(str){return str;};var target=query.split("\n");if(target.length==1)
this.matches=function(reverse,pos){var line=fold(cm.getLine(pos.line)),len=query.length,match;if(reverse?(pos.ch>=len&&(match=line.lastIndexOf(query,pos.ch-len))!=-1):(match=line.indexOf(query,pos.ch))!=-1)
return{from:{line:pos.line,ch:match},to:{line:pos.line,ch:match+len}};};else
this.matches=function(reverse,pos){var ln=pos.line,idx=(reverse?target.length-1:0),match=target[idx],line=fold(cm.getLine(ln));var offsetA=(reverse?line.indexOf(match)+match.length:line.lastIndexOf(match));if(reverse?offsetA>=pos.ch||offsetA!=match.length:offsetA<=pos.ch||offsetA!=line.length-match.length)
return;for(;;){if(reverse?!ln:ln==cm.lineCount()-1)return;line=fold(cm.getLine(ln+=reverse?-1:1));match=target[reverse?--idx:++idx];if(idx>0&&idx<target.length-1){if(line!=match)return;else continue;}
var offsetB=(reverse?line.lastIndexOf(match):line.indexOf(match)+match.length);if(reverse?offsetB!=line.length-match.length:offsetB!=match.length)
return;var start={line:pos.line,ch:offsetA},end={line:ln,ch:offsetB};return{from:reverse?end:start,to:reverse?start:end};}};}}
SearchCursor.prototype={findNext:function(){return this.find(false);},findPrevious:function(){return this.find(true);},find:function(reverse){var self=this,pos=this.cm.clipPos(reverse?this.pos.from:this.pos.to);function savePosAndFail(line){var pos={line:line,ch:0};self.pos={from:pos,to:pos};self.atOccurrence=false;return false;}
for(;;){if(this.pos=this.matches(reverse,pos)){this.atOccurrence=true;return this.pos.match||true;}
if(reverse){if(!pos.line)return savePosAndFail(0);pos={line:pos.line-1,ch:this.cm.getLine(pos.line-1).length};}
else{var maxLine=this.cm.lineCount();if(pos.line==maxLine-1)return savePosAndFail(maxLine);pos={line:pos.line+1,ch:0};}}},from:function(){if(this.atOccurrence)return this.pos.from;},to:function(){if(this.atOccurrence)return this.pos.to;},replace:function(newText){var self=this;if(this.atOccurrence)
self.pos.to=this.cm.replaceRange(newText,self.pos.from,self.pos.to);}};CodeMirror.defineExtension("getSearchCursor",function(query,pos,caseFold){return new SearchCursor(this,query,pos,caseFold);});})();(function(){function dialogDiv(cm,template){var wrap=cm.getWrapperElement();var dialog=wrap.insertBefore(document.createElement("div"),wrap.firstChild);dialog.className="CodeMirror-dialog";dialog.innerHTML='<div>'+template+'</div>';return dialog;}
CodeMirror.defineExtension("openDialog",function(template,callback){var dialog=dialogDiv(this,template);var closed=false,me=this;function close(){if(closed)return;closed=true;dialog.parentNode.removeChild(dialog);}
var inp=dialog.getElementsByTagName("input")[0];if(inp){CodeMirror.connect(inp,"keydown",function(e){if(e.keyCode==13||e.keyCode==27){CodeMirror.e_stop(e);close();me.focus();if(e.keyCode==13)callback(inp.value);}});inp.focus();CodeMirror.connect(inp,"blur",close);}
return close;});CodeMirror.defineExtension("openConfirm",function(template,callbacks){var dialog=dialogDiv(this,template);var buttons=dialog.getElementsByTagName("button");var closed=false,me=this,blurring=1;function close(){if(closed)return;closed=true;dialog.parentNode.removeChild(dialog);me.focus();}
buttons[0].focus();for(var i=0;i<buttons.length;++i){var b=buttons[i];(function(callback){CodeMirror.connect(b,"click",function(e){CodeMirror.e_preventDefault(e);close();if(callback)callback(me);});})(callbacks[i]);CodeMirror.connect(b,"blur",function(){--blurring;setTimeout(function(){if(blurring<=0)close();},200);});CodeMirror.connect(b,"focus",function(){++blurring;});}});})();CodeMirror.braceRangeFinder=function(cm,line){var lineText=cm.getLine(line);var startChar=lineText.lastIndexOf("{");if(startChar<0||lineText.lastIndexOf("}")>startChar)return;var tokenType=cm.getTokenAt({line:line,ch:startChar}).className;var count=1,lastLine=cm.lineCount(),end;outer:for(var i=line+1;i<lastLine;++i){var text=cm.getLine(i),pos=0;for(;;){var nextOpen=text.indexOf("{",pos),nextClose=text.indexOf("}",pos);if(nextOpen<0)nextOpen=text.length;if(nextClose<0)nextClose=text.length;pos=Math.min(nextOpen,nextClose);if(pos==text.length)break;if(cm.getTokenAt({line:i,ch:pos+1}).className==tokenType){if(pos==nextOpen)++count;else if(!--count){end=i;break outer;}}
++pos;}}
if(end==null||end==line+1)return;return end;};CodeMirror.newFoldFunction=function(rangeFinder,markText){var folded=[];if(markText==null)markText='<div style="position: absolute; left: 2px; color:#600">&#x25bc;</div>%N%';function isFolded(cm,n){for(var i=0;i<folded.length;++i){var start=cm.lineInfo(folded[i].start);if(!start)folded.splice(i--,1);else if(start.line==n)return{pos:i,region:folded[i]};}}
function expand(cm,region){cm.clearMarker(region.start);for(var i=0;i<region.hidden.length;++i)
cm.showLine(region.hidden[i]);}
return function(cm,line){cm.operation(function(){var known=isFolded(cm,line);if(known){folded.splice(known.pos,1);expand(cm,known.region);}else{var end=rangeFinder(cm,line);if(end==null)return;var hidden=[];for(var i=line+1;i<end;++i){var handle=cm.hideLine(i);if(handle)hidden.push(handle);}
var first=cm.setMarker(line,markText);var region={start:first,hidden:hidden};cm.onDeleteLine(first,function(){expand(cm,region);});folded.push(region);}});};};﻿
if(!CodeMirror.modeExtensions)CodeMirror.modeExtensions={};CodeMirror.defineExtension("getModeExt",function(){return CodeMirror.modeExtensions[this.getOption("mode")];});CodeMirror.defineExtension("getModeExtAtPos",function(pos){var token=this.getTokenAt(pos);if(token&&token.state&&token.state.mode)
return CodeMirror.modeExtensions[token.state.mode=="html"?"htmlmixed":token.state.mode];else
return this.getModeExt();});CodeMirror.defineExtension("commentRange",function(isComment,from,to){var curMode=this.getModeExtAtPos(this.getCursor());if(isComment){var commentedText=this.getRange(from,to);this.replaceRange(curMode.commentStart+this.getRange(from,to)+curMode.commentEnd,from,to);if(from.line==to.line&&from.ch==to.ch){this.setCursor(from.line,from.ch+curMode.commentStart.length);}}
else{var selText=this.getRange(from,to);var startIndex=selText.indexOf(curMode.commentStart);var endIndex=selText.lastIndexOf(curMode.commentEnd);if(startIndex>-1&&endIndex>-1&&endIndex>startIndex){selText=selText.substr(0,startIndex)
+selText.substring(startIndex+curMode.commentStart.length,endIndex)
+selText.substr(endIndex+curMode.commentEnd.length);}
this.replaceRange(selText,from,to);}});CodeMirror.defineExtension("autoIndentRange",function(from,to){var cmInstance=this;this.operation(function(){for(var i=from.line;i<=to.line;i++){cmInstance.indentLine(i);}});});CodeMirror.defineExtension("autoFormatRange",function(from,to){var absStart=this.indexFromPos(from);var absEnd=this.indexFromPos(to);var res=this.getModeExt().autoFormatLineBreaks(this.getValue(),absStart,absEnd);var cmInstance=this;this.operation(function(){cmInstance.replaceRange(res,from,to);var startLine=cmInstance.posFromIndex(absStart).line;var endLine=cmInstance.posFromIndex(absStart+res.length).line;for(var i=startLine;i<=endLine;i++){cmInstance.indentLine(i);}});});CodeMirror.modeExtensions["css"]={commentStart:"/*",commentEnd:"*/",wordWrapChars:[";","\\{","\\}"],autoFormatLineBreaks:function(text){return text.replace(new RegExp("(;|\\{|\\})([^\r\n])","g"),"$1\n$2");}};CodeMirror.modeExtensions["javascript"]={commentStart:"/*",commentEnd:"*/",wordWrapChars:[";","\\{","\\}"],getNonBreakableBlocks:function(text){var nonBreakableRegexes=[new RegExp("for\\s*?\\(([\\s\\S]*?)\\)"),new RegExp("'([\\s\\S]*?)('|$)"),new RegExp("\"([\\s\\S]*?)(\"|$)"),new RegExp("//.*([\r\n]|$)")];var nonBreakableBlocks=new Array();for(var i=0;i<nonBreakableRegexes.length;i++){var curPos=0;while(curPos<text.length){var m=text.substr(curPos).match(nonBreakableRegexes[i]);if(m!=null){nonBreakableBlocks.push({start:curPos+m.index,end:curPos+m.index+m[0].length});curPos+=m.index+Math.max(1,m[0].length);}
else{break;}}}
nonBreakableBlocks.sort(function(a,b){return a.start-b.start;});return nonBreakableBlocks;},autoFormatLineBreaks:function(text){var curPos=0;var reLinesSplitter=new RegExp("(;|\\{|\\})([^\r\n])","g");var nonBreakableBlocks=this.getNonBreakableBlocks(text);if(nonBreakableBlocks!=null){var res="";for(var i=0;i<nonBreakableBlocks.length;i++){if(nonBreakableBlocks[i].start>curPos){res+=text.substring(curPos,nonBreakableBlocks[i].start).replace(reLinesSplitter,"$1\n$2");curPos=nonBreakableBlocks[i].start;}
if(nonBreakableBlocks[i].start<=curPos&&nonBreakableBlocks[i].end>=curPos){res+=text.substring(curPos,nonBreakableBlocks[i].end);curPos=nonBreakableBlocks[i].end;}}
if(curPos<text.length-1){res+=text.substr(curPos).replace(reLinesSplitter,"$1\n$2");}
return res;}
else{return text.replace(reLinesSplitter,"$1\n$2");}}};CodeMirror.modeExtensions["xml"]={commentStart:"<!--",commentEnd:"-->",wordWrapChars:[">"],autoFormatLineBreaks:function(text){var lines=text.split("\n");var reProcessedPortion=new RegExp("(^\\s*?<|^[^<]*?)(.+)(>\\s*?$|[^>]*?$)");var reOpenBrackets=new RegExp("<","g");var reCloseBrackets=new RegExp("(>)([^\r\n])","g");for(var i=0;i<lines.length;i++){var mToProcess=lines[i].match(reProcessedPortion);if(mToProcess!=null&&mToProcess.length>3){lines[i]=mToProcess[1]
+mToProcess[2].replace(reOpenBrackets,"\n$&").replace(reCloseBrackets,"$1\n$2")
+mToProcess[3];continue;}}
return lines.join("\n");}};CodeMirror.modeExtensions["htmlmixed"]={commentStart:"<!--",commentEnd:"-->",wordWrapChars:[">",";","\\{","\\}"],getModeInfos:function(text,absPos){var modeInfos=new Array();modeInfos[0]={pos:0,modeExt:CodeMirror.modeExtensions["xml"],modeName:"xml"};var modeMatchers=new Array();modeMatchers[0]={regex:new RegExp("<style[^>]*>([\\s\\S]*?)(</style[^>]*>|$)","i"),modeExt:CodeMirror.modeExtensions["css"],modeName:"css"};modeMatchers[1]={regex:new RegExp("<script[^>]*>([\\s\\S]*?)(</script[^>]*>|$)","i"),modeExt:CodeMirror.modeExtensions["javascript"],modeName:"javascript"};var lastCharPos=(typeof(absPos)!=="undefined"?absPos:text.length-1);for(var i=0;i<modeMatchers.length;i++){var curPos=0;while(curPos<=lastCharPos){var m=text.substr(curPos).match(modeMatchers[i].regex);if(m!=null){if(m.length>1&&m[1].length>0){var blockBegin=curPos+m.index+m[0].indexOf(m[1]);modeInfos.push({pos:blockBegin,modeExt:modeMatchers[i].modeExt,modeName:modeMatchers[i].modeName});modeInfos.push({pos:blockBegin+m[1].length,modeExt:modeInfos[0].modeExt,modeName:modeInfos[0].modeName});curPos+=m.index+m[0].length;continue;}
else{curPos+=m.index+Math.max(m[0].length,1);}}
else{break;}}}
modeInfos.sort(function sortModeInfo(a,b){return a.pos-b.pos;});return modeInfos;},autoFormatLineBreaks:function(text,startPos,endPos){var modeInfos=this.getModeInfos(text);var reBlockStartsWithNewline=new RegExp("^\\s*?\n");var reBlockEndsWithNewline=new RegExp("\n\\s*?$");var res="";if(modeInfos.length>1){for(var i=1;i<=modeInfos.length;i++){var selStart=modeInfos[i-1].pos;var selEnd=(i<modeInfos.length?modeInfos[i].pos:endPos);if(selStart>=endPos){break;}
if(selStart<startPos){if(selEnd<=startPos){continue;}
selStart=startPos;}
if(selEnd>endPos){selEnd=endPos;}
var textPortion=text.substring(selStart,selEnd);if(modeInfos[i-1].modeName!="xml"){if(!reBlockStartsWithNewline.test(textPortion)&&selStart>0){textPortion="\n"+textPortion;}
if(!reBlockEndsWithNewline.test(textPortion)&&selEnd<text.length-1){textPortion+="\n";}}
res+=modeInfos[i-1].modeExt.autoFormatLineBreaks(textPortion);}}
else{res=modeInfos[0].modeExt.autoFormatLineBreaks(text.substring(startPos,endPos));}
return res;}};(function(){CodeMirror.simpleHint=function(editor,getHints){if(editor.somethingSelected())return;var result=getHints(editor);if(!result||!result.list.length)return;var completions=result.list;function insert(str){editor.replaceRange(str,result.from,result.to);}
if(completions.length==1){insert(completions[0]);return true;}
var complete=document.createElement("div");complete.className="CodeMirror-completions";var sel=complete.appendChild(document.createElement("select"));if(!window.opera)sel.multiple=true;for(var i=0;i<completions.length;++i){var opt=sel.appendChild(document.createElement("option"));opt.appendChild(document.createTextNode(completions[i]));}
sel.firstChild.selected=true;sel.size=Math.min(10,completions.length);var pos=editor.cursorCoords();complete.style.left=pos.x+"px";complete.style.top=pos.yBot+"px";document.body.appendChild(complete);if(completions.length<=10)
complete.style.width=(sel.clientWidth-1)+"px";var done=false;function close(){if(done)return;done=true;complete.parentNode.removeChild(complete);}
function pick(){insert(completions[sel.selectedIndex]);close();setTimeout(function(){editor.focus();},50);}
CodeMirror.connect(sel,"blur",close);CodeMirror.connect(sel,"keydown",function(event){var code=event.keyCode;if(code==13){CodeMirror.e_stop(event);pick();}
else if(code==27){CodeMirror.e_stop(event);close();editor.focus();}
else if(code!=38&&code!=40){close();editor.focus();setTimeout(function(){CodeMirror.simpleHint(editor,getHints);},50);}});CodeMirror.connect(sel,"dblclick",pick);sel.focus();if(window.opera)setTimeout(function(){if(!done)sel.focus();},100);return true;};})();(function(){function forEach(arr,f){for(var i=0,e=arr.length;i<e;++i)f(arr[i]);}
function arrayContains(arr,item){if(!Array.prototype.indexOf){var i=arr.length;while(i--){if(arr[i]===item){return true;}}
return false;}
return arr.indexOf(item)!=-1;}
CodeMirror.javascriptHint=function(editor){var cur=editor.getCursor(),token=editor.getTokenAt(cur),tprop=token;if(!/^[\w$_]*$/.test(token.string)){token=tprop={start:cur.ch,end:cur.ch,string:"",state:token.state,className:token.string=="."?"property":null};}
while(tprop.className=="property"){tprop=editor.getTokenAt({line:cur.line,ch:tprop.start});if(tprop.string!=".")return;tprop=editor.getTokenAt({line:cur.line,ch:tprop.start});if(!context)var context=[];context.push(tprop);}
return{list:getCompletions(token,context),from:{line:cur.line,ch:token.start},to:{line:cur.line,ch:token.end}};}
var stringProps=("charAt charCodeAt indexOf lastIndexOf substring substr slice trim trimLeft trimRight "+"toUpperCase toLowerCase split concat match replace search").split(" ");var arrayProps=("length concat join splice push pop shift unshift slice reverse sort indexOf "+"lastIndexOf every some filter forEach map reduce reduceRight ").split(" ");var funcProps="prototype apply call bind".split(" ");var keywords=("break case catch continue debugger default delete do else false finally for function "+"if in instanceof new null return switch throw true try typeof var void while with").split(" ");function getCompletions(token,context){var found=[],start=token.string;function maybeAdd(str){if(str.indexOf(start)==0&&!arrayContains(found,str))found.push(str);}
function gatherCompletions(obj){if(typeof obj=="string")forEach(stringProps,maybeAdd);else if(obj instanceof Array)forEach(arrayProps,maybeAdd);else if(obj instanceof Function)forEach(funcProps,maybeAdd);for(var name in obj)maybeAdd(name);}
if(context){var obj=context.pop(),base;if(obj.className=="variable")
base=window[obj.string];else if(obj.className=="string")
base="";else if(obj.className=="atom")
base=1;while(base!=null&&context.length)
base=base[context.pop().string];if(base!=null)gatherCompletions(base);}
else{for(var v=token.state.localVars;v;v=v.next)maybeAdd(v.name);gatherCompletions(window);forEach(keywords,maybeAdd);}
return found;}})();CodeMirror.overlayParser=function(base,overlay,combine){return{startState:function(){return{base:CodeMirror.startState(base),overlay:CodeMirror.startState(overlay),basePos:0,baseCur:null,overlayPos:0,overlayCur:null};},copyState:function(state){return{base:CodeMirror.copyState(base,state.base),overlay:CodeMirror.copyState(overlay,state.overlay),basePos:state.basePos,baseCur:null,overlayPos:state.overlayPos,overlayCur:null};},token:function(stream,state){if(stream.start==state.basePos){state.baseCur=base.token(stream,state.base);state.basePos=stream.pos;}
if(stream.start==state.overlayPos){stream.pos=stream.start;state.overlayCur=overlay.token(stream,state.overlay);state.overlayPos=stream.pos;}
stream.pos=Math.min(state.basePos,state.overlayPos);if(stream.eol())state.basePos=state.overlayPos=0;if(state.overlayCur==null)return state.baseCur;if(state.baseCur!=null&&combine)return state.baseCur+" "+state.overlayCur;else return state.overlayCur;},indent:function(state,textAfter){return base.indent(state.base,textAfter);},electricChars:base.electricChars};};CodeMirror.defineMode("clike",function(config,parserConfig){var indentUnit=config.indentUnit,keywords=parserConfig.keywords||{},blockKeywords=parserConfig.blockKeywords||{},atoms=parserConfig.atoms||{},hooks=parserConfig.hooks||{},multiLineStrings=parserConfig.multiLineStrings;var isOperatorChar=/[+\-*&%=<>!?|\/]/;var curPunc;function tokenBase(stream,state){var ch=stream.next();if(hooks[ch]){var result=hooks[ch](stream,state);if(result!==false)return result;}
if(ch=='"'||ch=="'"){state.tokenize=tokenString(ch);return state.tokenize(stream,state);}
if(/[\[\]{}\(\),;\:\.]/.test(ch)){curPunc=ch;return null}
if(/\d/.test(ch)){stream.eatWhile(/[\w\.]/);return"number";}
if(ch=="/"){if(stream.eat("*")){state.tokenize=tokenComment;return tokenComment(stream,state);}
if(stream.eat("/")){stream.skipToEnd();return"comment";}}
if(isOperatorChar.test(ch)){stream.eatWhile(isOperatorChar);return"operator";}
stream.eatWhile(/[\w\$_]/);var cur=stream.current();if(keywords.propertyIsEnumerable(cur)){if(blockKeywords.propertyIsEnumerable(cur))curPunc="newstatement";return"keyword";}
if(atoms.propertyIsEnumerable(cur))return"atom";return"word";}
function tokenString(quote){return function(stream,state){var escaped=false,next,end=false;while((next=stream.next())!=null){if(next==quote&&!escaped){end=true;break;}
escaped=!escaped&&next=="\\";}
if(end||!(escaped||multiLineStrings))
state.tokenize=tokenBase;return"string";};}
function tokenComment(stream,state){var maybeEnd=false,ch;while(ch=stream.next()){if(ch=="/"&&maybeEnd){state.tokenize=tokenBase;break;}
maybeEnd=(ch=="*");}
return"comment";}
function Context(indented,column,type,align,prev){this.indented=indented;this.column=column;this.type=type;this.align=align;this.prev=prev;}
function pushContext(state,col,type){return state.context=new Context(state.indented,col,type,null,state.context);}
function popContext(state){var t=state.context.type;if(t==")"||t=="]"||t=="}")
state.indented=state.context.indented;return state.context=state.context.prev;}
return{startState:function(basecolumn){return{tokenize:null,context:new Context((basecolumn||0)-indentUnit,0,"top",false),indented:0,startOfLine:true};},token:function(stream,state){var ctx=state.context;if(stream.sol()){if(ctx.align==null)ctx.align=false;state.indented=stream.indentation();state.startOfLine=true;}
if(stream.eatSpace())return null;curPunc=null;var style=(state.tokenize||tokenBase)(stream,state);if(style=="comment"||style=="meta")return style;if(ctx.align==null)ctx.align=true;if((curPunc==";"||curPunc==":")&&ctx.type=="statement")popContext(state);else if(curPunc=="{")pushContext(state,stream.column(),"}");else if(curPunc=="[")pushContext(state,stream.column(),"]");else if(curPunc=="(")pushContext(state,stream.column(),")");else if(curPunc=="}"){while(ctx.type=="statement")ctx=popContext(state);if(ctx.type=="}")ctx=popContext(state);while(ctx.type=="statement")ctx=popContext(state);}
else if(curPunc==ctx.type)popContext(state);else if(ctx.type=="}"||ctx.type=="top"||(ctx.type=="statement"&&curPunc=="newstatement"))
pushContext(state,stream.column(),"statement");state.startOfLine=false;return style;},indent:function(state,textAfter){if(state.tokenize!=tokenBase&&state.tokenize!=null)return 0;var ctx=state.context,firstChar=textAfter&&textAfter.charAt(0);if(ctx.type=="statement"&&firstChar=="}")ctx=ctx.prev;var closing=firstChar==ctx.type;if(ctx.type=="statement")return ctx.indented+(firstChar=="{"?0:indentUnit);else if(ctx.align)return ctx.column+(closing?0:1);else return ctx.indented+(closing?0:indentUnit);},electricChars:"{}"};});(function(){function words(str){var obj={},words=str.split(" ");for(var i=0;i<words.length;++i)obj[words[i]]=true;return obj;}
var cKeywords="auto if break int case long char register continue return default short do sizeof "+"double static else struct entry switch extern typedef float union for unsigned "+"goto while enum void const signed volatile";function cppHook(stream,state){if(!state.startOfLine)return false;stream.skipToEnd();return"meta";}
function tokenAtString(stream,state){var next;while((next=stream.next())!=null){if(next=='"'&&!stream.eat('"')){state.tokenize=null;break;}}
return"string";}
CodeMirror.defineMIME("text/x-csrc",{name:"clike",keywords:words(cKeywords),blockKeywords:words("case do else for if switch while struct"),atoms:words("null"),hooks:{"#":cppHook}});CodeMirror.defineMIME("text/x-c++src",{name:"clike",keywords:words(cKeywords+" asm dynamic_cast namespace reinterpret_cast try bool explicit new "+"static_cast typeid catch operator template typename class friend private "+"this using const_cast inline public throw virtual delete mutable protected "+"wchar_t"),blockKeywords:words("catch class do else finally for if struct switch try while"),atoms:words("true false null"),hooks:{"#":cppHook}});CodeMirror.defineMIME("text/x-java",{name:"clike",keywords:words("abstract assert boolean break byte case catch char class const continue default "+"do double else enum extends final finally float for goto if implements import "+"instanceof int interface long native new package private protected public "+"return short static strictfp super switch synchronized this throw throws transient "+"try void volatile while"),blockKeywords:words("catch class do else finally for if switch try while"),atoms:words("true false null"),hooks:{"@":function(stream,state){stream.eatWhile(/[\w\$_]/);return"meta";}}});CodeMirror.defineMIME("text/x-csharp",{name:"clike",keywords:words("abstract as base bool break byte case catch char checked class const continue decimal"+" default delegate do double else enum event explicit extern finally fixed float for"+" foreach goto if implicit in int interface internal is lock long namespace new object"+" operator out override params private protected public readonly ref return sbyte sealed short"+" sizeof stackalloc static string struct switch this throw try typeof uint ulong unchecked"+" unsafe ushort using virtual void volatile while add alias ascending descending dynamic from get"+" global group into join let orderby partial remove select set value var yield"),blockKeywords:words("catch class do else finally for foreach if struct switch try while"),atoms:words("true false null"),hooks:{"@":function(stream,state){if(stream.eat('"')){state.tokenize=tokenAtString;return tokenAtString(stream,state);}
stream.eatWhile(/[\w\$_]/);return"meta";}}});CodeMirror.defineMIME("text/x-groovy",{name:"clike",keywords:words("abstract as assert boolean break byte case catch char class const continue def default "+"do double else enum extends final finally float for goto if implements import "+"in instanceof int interface long native new package property private protected public "+"return short static strictfp super switch synchronized this throw throws transient "+"try void volatile while"),atoms:words("true false null"),hooks:{"@":function(stream,state){stream.eatWhile(/[\w\$_]/);return"meta";}}});}());CodeMirror.defineMode("css",function(config){var indentUnit=config.indentUnit,type;function ret(style,tp){type=tp;return style;}
function tokenBase(stream,state){var ch=stream.next();if(ch=="@"){stream.eatWhile(/[\w\\\-]/);return ret("meta",stream.current());}
else if(ch=="/"&&stream.eat("*")){state.tokenize=tokenCComment;return tokenCComment(stream,state);}
else if(ch=="<"&&stream.eat("!")){state.tokenize=tokenSGMLComment;return tokenSGMLComment(stream,state);}
else if(ch=="=")ret(null,"compare");else if((ch=="~"||ch=="|")&&stream.eat("="))return ret(null,"compare");else if(ch=="\""||ch=="'"){state.tokenize=tokenString(ch);return state.tokenize(stream,state);}
else if(ch=="#"){stream.eatWhile(/[\w\\\-]/);return ret("atom","hash");}
else if(ch=="!"){stream.match(/^\s*\w*/);return ret("keyword","important");}
else if(/\d/.test(ch)){stream.eatWhile(/[\w.%]/);return ret("number","unit");}
else if(/[,.+>*\/]/.test(ch)){return ret(null,"select-op");}
else if(/[;{}:\[\]]/.test(ch)){return ret(null,ch);}
else{stream.eatWhile(/[\w\\\-]/);return ret("variable","variable");}}
function tokenCComment(stream,state){var maybeEnd=false,ch;while((ch=stream.next())!=null){if(maybeEnd&&ch=="/"){state.tokenize=tokenBase;break;}
maybeEnd=(ch=="*");}
return ret("comment","comment");}
function tokenSGMLComment(stream,state){var dashes=0,ch;while((ch=stream.next())!=null){if(dashes>=2&&ch==">"){state.tokenize=tokenBase;break;}
dashes=(ch=="-")?dashes+1:0;}
return ret("comment","comment");}
function tokenString(quote){return function(stream,state){var escaped=false,ch;while((ch=stream.next())!=null){if(ch==quote&&!escaped)
break;escaped=!escaped&&ch=="\\";}
if(!escaped)state.tokenize=tokenBase;return ret("string","string");};}
return{startState:function(base){return{tokenize:tokenBase,baseIndent:base||0,stack:[]};},token:function(stream,state){if(stream.eatSpace())return null;var style=state.tokenize(stream,state);var context=state.stack[state.stack.length-1];if(type=="hash"&&context=="rule")style="atom";else if(style=="variable"){if(context=="rule")style="number";else if(!context||context=="@media{")style="tag";}
if(context=="rule"&&/^[\{\};]$/.test(type))
state.stack.pop();if(type=="{"){if(context=="@media")state.stack[state.stack.length-1]="@media{";else state.stack.push("{");}
else if(type=="}")state.stack.pop();else if(type=="@media")state.stack.push("@media");else if(context=="{"&&type!="comment")state.stack.push("rule");return style;},indent:function(state,textAfter){var n=state.stack.length;if(/^\}/.test(textAfter))
n-=state.stack[state.stack.length-1]=="rule"?2:1;return state.baseIndent+n*indentUnit;},electricChars:"}"};});CodeMirror.defineMIME("text/css","css");CodeMirror.defineMode("javascript",function(config,parserConfig){var indentUnit=config.indentUnit;var jsonMode=parserConfig.json;var keywords=function(){function kw(type){return{type:type,style:"keyword"};}
var A=kw("keyword a"),B=kw("keyword b"),C=kw("keyword c");var operator=kw("operator"),atom={type:"atom",style:"atom"};return{"if":A,"while":A,"with":A,"else":B,"do":B,"try":B,"finally":B,"return":C,"break":C,"continue":C,"new":C,"delete":C,"throw":C,"var":kw("var"),"const":kw("var"),"let":kw("var"),"function":kw("function"),"catch":kw("catch"),"for":kw("for"),"switch":kw("switch"),"case":kw("case"),"default":kw("default"),"in":operator,"typeof":operator,"instanceof":operator,"true":atom,"false":atom,"null":atom,"undefined":atom,"NaN":atom,"Infinity":atom};}();var isOperatorChar=/[+\-*&%=<>!?|]/;function chain(stream,state,f){state.tokenize=f;return f(stream,state);}
function nextUntilUnescaped(stream,end){var escaped=false,next;while((next=stream.next())!=null){if(next==end&&!escaped)
return false;escaped=!escaped&&next=="\\";}
return escaped;}
var type,content;function ret(tp,style,cont){type=tp;content=cont;return style;}
function jsTokenBase(stream,state){var ch=stream.next();if(ch=='"'||ch=="'")
return chain(stream,state,jsTokenString(ch));else if(/[\[\]{}\(\),;\:\.]/.test(ch))
return ret(ch);else if(ch=="0"&&stream.eat(/x/i)){stream.eatWhile(/[\da-f]/i);return ret("number","number");}
else if(/\d/.test(ch)){stream.match(/^\d*(?:\.\d*)?(?:[eE][+\-]?\d+)?/);return ret("number","number");}
else if(ch=="/"){if(stream.eat("*")){return chain(stream,state,jsTokenComment);}
else if(stream.eat("/")){stream.skipToEnd();return ret("comment","comment");}
else if(state.reAllowed){nextUntilUnescaped(stream,"/");stream.eatWhile(/[gimy]/);return ret("regexp","string");}
else{stream.eatWhile(isOperatorChar);return ret("operator",null,stream.current());}}
else if(ch=="#"){stream.skipToEnd();return ret("error","error");}
else if(isOperatorChar.test(ch)){stream.eatWhile(isOperatorChar);return ret("operator",null,stream.current());}
else{stream.eatWhile(/[\w\$_]/);var word=stream.current(),known=keywords.propertyIsEnumerable(word)&&keywords[word];return(known&&state.kwAllowed)?ret(known.type,known.style,word):ret("variable","variable",word);}}
function jsTokenString(quote){return function(stream,state){if(!nextUntilUnescaped(stream,quote))
state.tokenize=jsTokenBase;return ret("string","string");};}
function jsTokenComment(stream,state){var maybeEnd=false,ch;while(ch=stream.next()){if(ch=="/"&&maybeEnd){state.tokenize=jsTokenBase;break;}
maybeEnd=(ch=="*");}
return ret("comment","comment");}
var atomicTypes={"atom":true,"number":true,"variable":true,"string":true,"regexp":true};function JSLexical(indented,column,type,align,prev,info){this.indented=indented;this.column=column;this.type=type;this.prev=prev;this.info=info;if(align!=null)this.align=align;}
function inScope(state,varname){for(var v=state.localVars;v;v=v.next)
if(v.name==varname)return true;}
function parseJS(state,style,type,content,stream){var cc=state.cc;cx.state=state;cx.stream=stream;cx.marked=null,cx.cc=cc;if(!state.lexical.hasOwnProperty("align"))
state.lexical.align=true;while(true){var combinator=cc.length?cc.pop():jsonMode?expression:statement;if(combinator(type,content)){while(cc.length&&cc[cc.length-1].lex)
cc.pop()();if(cx.marked)return cx.marked;if(type=="variable"&&inScope(state,content))return"variable-2";return style;}}}
var cx={state:null,column:null,marked:null,cc:null};function pass(){for(var i=arguments.length-1;i>=0;i--)cx.cc.push(arguments[i]);}
function cont(){pass.apply(null,arguments);return true;}
function register(varname){var state=cx.state;if(state.context){cx.marked="def";for(var v=state.localVars;v;v=v.next)
if(v.name==varname)return;state.localVars={name:varname,next:state.localVars};}}
var defaultVars={name:"this",next:{name:"arguments"}};function pushcontext(){if(!cx.state.context)cx.state.localVars=defaultVars;cx.state.context={prev:cx.state.context,vars:cx.state.localVars};}
function popcontext(){cx.state.localVars=cx.state.context.vars;cx.state.context=cx.state.context.prev;}
function pushlex(type,info){var result=function(){var state=cx.state;state.lexical=new JSLexical(state.indented,cx.stream.column(),type,null,state.lexical,info)};result.lex=true;return result;}
function poplex(){var state=cx.state;if(state.lexical.prev){if(state.lexical.type==")")
state.indented=state.lexical.indented;state.lexical=state.lexical.prev;}}
poplex.lex=true;function expect(wanted){return function expecting(type){if(type==wanted)return cont();else if(wanted==";")return pass();else return cont(arguments.callee);};}
function statement(type){if(type=="var")return cont(pushlex("vardef"),vardef1,expect(";"),poplex);if(type=="keyword a")return cont(pushlex("form"),expression,statement,poplex);if(type=="keyword b")return cont(pushlex("form"),statement,poplex);if(type=="{")return cont(pushlex("}"),block,poplex);if(type==";")return cont();if(type=="function")return cont(functiondef);if(type=="for")return cont(pushlex("form"),expect("("),pushlex(")"),forspec1,expect(")"),poplex,statement,poplex);if(type=="variable")return cont(pushlex("stat"),maybelabel);if(type=="switch")return cont(pushlex("form"),expression,pushlex("}","switch"),expect("{"),block,poplex,poplex);if(type=="case")return cont(expression,expect(":"));if(type=="default")return cont(expect(":"));if(type=="catch")return cont(pushlex("form"),pushcontext,expect("("),funarg,expect(")"),statement,poplex,popcontext);return pass(pushlex("stat"),expression,expect(";"),poplex);}
function expression(type){if(atomicTypes.hasOwnProperty(type))return cont(maybeoperator);if(type=="function")return cont(functiondef);if(type=="keyword c")return cont(maybeexpression);if(type=="(")return cont(pushlex(")"),expression,expect(")"),poplex,maybeoperator);if(type=="operator")return cont(expression);if(type=="[")return cont(pushlex("]"),commasep(expression,"]"),poplex,maybeoperator);if(type=="{")return cont(pushlex("}"),commasep(objprop,"}"),poplex,maybeoperator);return cont();}
function maybeexpression(type){if(type.match(/[;\}\)\],]/))return pass();return pass(expression);}
function maybeoperator(type,value){if(type=="operator"&&/\+\+|--/.test(value))return cont(maybeoperator);if(type=="operator")return cont(expression);if(type==";")return;if(type=="(")return cont(pushlex(")"),commasep(expression,")"),poplex,maybeoperator);if(type==".")return cont(property,maybeoperator);if(type=="[")return cont(pushlex("]"),expression,expect("]"),poplex,maybeoperator);}
function maybelabel(type){if(type==":")return cont(poplex,statement);return pass(maybeoperator,expect(";"),poplex);}
function property(type){if(type=="variable"){cx.marked="property";return cont();}}
function objprop(type){if(type=="variable")cx.marked="property";if(atomicTypes.hasOwnProperty(type))return cont(expect(":"),expression);}
function commasep(what,end){function proceed(type){if(type==",")return cont(what,proceed);if(type==end)return cont();return cont(expect(end));}
return function commaSeparated(type){if(type==end)return cont();else return pass(what,proceed);};}
function block(type){if(type=="}")return cont();return pass(statement,block);}
function vardef1(type,value){if(type=="variable"){register(value);return cont(vardef2);}
return cont();}
function vardef2(type,value){if(value=="=")return cont(expression,vardef2);if(type==",")return cont(vardef1);}
function forspec1(type){if(type=="var")return cont(vardef1,forspec2);if(type==";")return pass(forspec2);if(type=="variable")return cont(formaybein);return pass(forspec2);}
function formaybein(type,value){if(value=="in")return cont(expression);return cont(maybeoperator,forspec2);}
function forspec2(type,value){if(type==";")return cont(forspec3);if(value=="in")return cont(expression);return cont(expression,expect(";"),forspec3);}
function forspec3(type){if(type!=")")cont(expression);}
function functiondef(type,value){if(type=="variable"){register(value);return cont(functiondef);}
if(type=="(")return cont(pushlex(")"),pushcontext,commasep(funarg,")"),poplex,statement,popcontext);}
function funarg(type,value){if(type=="variable"){register(value);return cont();}}
return{startState:function(basecolumn){return{tokenize:jsTokenBase,reAllowed:true,kwAllowed:true,cc:[],lexical:new JSLexical((basecolumn||0)-indentUnit,0,"block",false),localVars:null,context:null,indented:0};},token:function(stream,state){if(stream.sol()){if(!state.lexical.hasOwnProperty("align"))
state.lexical.align=false;state.indented=stream.indentation();}
if(stream.eatSpace())return null;var style=state.tokenize(stream,state);if(type=="comment")return style;state.reAllowed=type=="operator"||type=="keyword c"||type.match(/^[\[{}\(,;:]$/);state.kwAllowed=type!='.';return parseJS(state,style,type,content,stream);},indent:function(state,textAfter){if(state.tokenize!=jsTokenBase)return 0;var firstChar=textAfter&&textAfter.charAt(0),lexical=state.lexical,type=lexical.type,closing=firstChar==type;if(type=="vardef")return lexical.indented+4;else if(type=="form"&&firstChar=="{")return lexical.indented;else if(type=="stat"||type=="form")return lexical.indented+indentUnit;else if(lexical.info=="switch"&&!closing)
return lexical.indented+(/^(?:case|default)\b/.test(textAfter)?indentUnit:2*indentUnit);else if(lexical.align)return lexical.column+(closing?0:1);else return lexical.indented+(closing?0:indentUnit);},electricChars:":{}"};});CodeMirror.defineMIME("text/javascript","javascript");CodeMirror.defineMIME("application/json",{name:"javascript",json:true});CodeMirror.defineMode("xml",function(config,parserConfig){var indentUnit=config.indentUnit;var Kludges=parserConfig.htmlMode?{autoSelfClosers:{"br":true,"img":true,"hr":true,"link":true,"input":true,"meta":true,"col":true,"frame":true,"base":true,"area":true},doNotIndent:{"pre":true},allowUnquoted:true}:{autoSelfClosers:{},doNotIndent:{},allowUnquoted:false};var alignCDATA=parserConfig.alignCDATA;var tagName,type;function inText(stream,state){function chain(parser){state.tokenize=parser;return parser(stream,state);}
var ch=stream.next();if(ch=="<"){if(stream.eat("!")){if(stream.eat("[")){if(stream.match("CDATA["))return chain(inBlock("atom","]]>"));else return null;}
else if(stream.match("--"))return chain(inBlock("comment","-->"));else if(stream.match("DOCTYPE",true,true)){stream.eatWhile(/[\w\._\-]/);return chain(doctype(1));}
else return null;}
else if(stream.eat("?")){stream.eatWhile(/[\w\._\-]/);state.tokenize=inBlock("meta","?>");return"meta";}
else{type=stream.eat("/")?"closeTag":"openTag";stream.eatSpace();tagName="";var c;while((c=stream.eat(/[^\s\u00a0=<>\"\'\/?]/)))tagName+=c;state.tokenize=inTag;return"tag";}}
else if(ch=="&"){stream.eatWhile(/[^;]/);stream.eat(";");return"atom";}
else{stream.eatWhile(/[^&<]/);return null;}}
function inTag(stream,state){var ch=stream.next();if(ch==">"||(ch=="/"&&stream.eat(">"))){state.tokenize=inText;type=ch==">"?"endTag":"selfcloseTag";return"tag";}
else if(ch=="="){type="equals";return null;}
else if(/[\'\"]/.test(ch)){state.tokenize=inAttribute(ch);return state.tokenize(stream,state);}
else{stream.eatWhile(/[^\s\u00a0=<>\"\'\/?]/);return"word";}}
function inAttribute(quote){return function(stream,state){while(!stream.eol()){if(stream.next()==quote){state.tokenize=inTag;break;}}
return"string";};}
function inBlock(style,terminator){return function(stream,state){while(!stream.eol()){if(stream.match(terminator)){state.tokenize=inText;break;}
stream.next();}
return style;};}
function doctype(depth){return function(stream,state){var ch;while((ch=stream.next())!=null){if(ch=="<"){state.tokenize=doctype(depth+1);return state.tokenize(stream,state);}else if(ch==">"){if(depth==1){state.tokenize=inText;break;}else{state.tokenize=doctype(depth-1);return state.tokenize(stream,state);}}}
return"meta";};}
var curState,setStyle;function pass(){for(var i=arguments.length-1;i>=0;i--)curState.cc.push(arguments[i]);}
function cont(){pass.apply(null,arguments);return true;}
function pushContext(tagName,startOfLine){var noIndent=Kludges.doNotIndent.hasOwnProperty(tagName)||(curState.context&&curState.context.noIndent);curState.context={prev:curState.context,tagName:tagName,indent:curState.indented,startOfLine:startOfLine,noIndent:noIndent};}
function popContext(){if(curState.context)curState.context=curState.context.prev;}
function element(type){if(type=="openTag"){curState.tagName=tagName;return cont(attributes,endtag(curState.startOfLine));}else if(type=="closeTag"){var err=false;if(curState.context){err=curState.context.tagName!=tagName;}else{err=true;}
if(err)setStyle="error";return cont(endclosetag(err));}
return cont();}
function endtag(startOfLine){return function(type){if(type=="selfcloseTag"||(type=="endTag"&&Kludges.autoSelfClosers.hasOwnProperty(curState.tagName.toLowerCase())))
return cont();if(type=="endTag"){pushContext(curState.tagName,startOfLine);return cont();}
return cont();};}
function endclosetag(err){return function(type){if(err)setStyle="error";if(type=="endTag"){popContext();return cont();}
setStyle="error";return cont(arguments.callee);}}
function attributes(type){if(type=="word"){setStyle="attribute";return cont(attributes);}
if(type=="equals")return cont(attvalue,attributes);if(type=="string"){setStyle="error";return cont(attributes);}
return pass();}
function attvalue(type){if(type=="word"&&Kludges.allowUnquoted){setStyle="string";return cont();}
if(type=="string")return cont(attvaluemaybe);return pass();}
function attvaluemaybe(type){if(type=="string")return cont(attvaluemaybe);else return pass();}
return{startState:function(){return{tokenize:inText,cc:[],indented:0,startOfLine:true,tagName:null,context:null};},token:function(stream,state){if(stream.sol()){state.startOfLine=true;state.indented=stream.indentation();}
if(stream.eatSpace())return null;setStyle=type=tagName=null;var style=state.tokenize(stream,state);state.type=type;if((style||type)&&style!="comment"){curState=state;while(true){var comb=state.cc.pop()||element;if(comb(type||style))break;}}
state.startOfLine=false;return setStyle||style;},indent:function(state,textAfter,fullLine){var context=state.context;if((state.tokenize!=inTag&&state.tokenize!=inText)||context&&context.noIndent)
return fullLine?fullLine.match(/^(\s*)/)[0].length:0;if(alignCDATA&&/<!\[CDATA\[/.test(textAfter))return 0;if(context&&/^<\//.test(textAfter))
context=context.prev;while(context&&!context.startOfLine)
context=context.prev;if(context)return context.indent+indentUnit;else return 0;},compareStates:function(a,b){if(a.indented!=b.indented||a.tokenize!=b.tokenize)return false;for(var ca=a.context,cb=b.context;;ca=ca.prev,cb=cb.prev){if(!ca||!cb)return ca==cb;if(ca.tagName!=cb.tagName)return false;}},electricChars:"/"};});CodeMirror.defineMIME("application/xml","xml");CodeMirror.defineMIME("text/html",{name:"xml",htmlMode:true});CodeMirror.defineMode("htmlmixed",function(config,parserConfig){var htmlMode=CodeMirror.getMode(config,{name:"xml",htmlMode:true});var jsMode=CodeMirror.getMode(config,"javascript");var cssMode=CodeMirror.getMode(config,"css");function html(stream,state){var style=htmlMode.token(stream,state.htmlState);if(style=="tag"&&stream.current()==">"&&state.htmlState.context){if(/^script$/i.test(state.htmlState.context.tagName)){state.token=javascript;state.localState=jsMode.startState(htmlMode.indent(state.htmlState,""));state.mode="javascript";}
else if(/^style$/i.test(state.htmlState.context.tagName)){state.token=css;state.localState=cssMode.startState(htmlMode.indent(state.htmlState,""));state.mode="css";}}
return style;}
function maybeBackup(stream,pat,style){var cur=stream.current();var close=cur.search(pat);if(close>-1)stream.backUp(cur.length-close);return style;}
function javascript(stream,state){if(stream.match(/^<\/\s*script\s*>/i,false)){state.token=html;state.curState=null;state.mode="html";return html(stream,state);}
return maybeBackup(stream,/<\/\s*script\s*>/,jsMode.token(stream,state.localState));}
function css(stream,state){if(stream.match(/^<\/\s*style\s*>/i,false)){state.token=html;state.localState=null;state.mode="html";return html(stream,state);}
return maybeBackup(stream,/<\/\s*style\s*>/,cssMode.token(stream,state.localState));}
return{startState:function(){var state=htmlMode.startState();return{token:html,localState:null,mode:"html",htmlState:state};},copyState:function(state){if(state.localState)
var local=CodeMirror.copyState(state.token==css?cssMode:jsMode,state.localState);return{token:state.token,localState:local,mode:state.mode,htmlState:CodeMirror.copyState(htmlMode,state.htmlState)};},token:function(stream,state){return state.token(stream,state);},indent:function(state,textAfter){if(state.token==html||/^\s*<\//.test(textAfter))
return htmlMode.indent(state.htmlState,textAfter);else if(state.token==javascript)
return jsMode.indent(state.localState,textAfter);else
return cssMode.indent(state.localState,textAfter);},compareStates:function(a,b){return htmlMode.compareStates(a.htmlState,b.htmlState);},electricChars:"/{}:"}});CodeMirror.defineMIME("text/html","htmlmixed");CodeMirror.defineMode("htmlembedded",function(config,parserConfig){var scriptStartRegex=parserConfig.scriptStartRegex||/^<%/i,scriptEndRegex=parserConfig.scriptEndRegex||/^%>/i;var scriptingMode,htmlMixedMode;function htmlDispatch(stream,state){if(stream.match(scriptStartRegex,false)){state.token=scriptingDispatch;return scriptingMode.token(stream,state.scriptState);}
else
return htmlMixedMode.token(stream,state.htmlState);}
function scriptingDispatch(stream,state){if(stream.match(scriptEndRegex,false)){state.token=htmlDispatch;return htmlMixedMode.token(stream,state.htmlState);}
else
return scriptingMode.token(stream,state.scriptState);}
return{startState:function(){scriptingMode=scriptingMode||CodeMirror.getMode(config,parserConfig.scriptingModeSpec);htmlMixedMode=htmlMixedMode||CodeMirror.getMode(config,"htmlmixed");return{token:parserConfig.startOpen?scriptingDispatch:htmlDispatch,htmlState:htmlMixedMode.startState(),scriptState:scriptingMode.startState()}},token:function(stream,state){return state.token(stream,state);},indent:function(state,textAfter){if(state.token==htmlDispatch)
return htmlMixedMode.indent(state.htmlState,textAfter);else
return scriptingMode.indent(state.scriptState,textAfter);},copyState:function(state){return{token:state.token,htmlState:CodeMirror.copyState(htmlMixedMode,state.htmlState),scriptState:CodeMirror.copyState(scriptingMode,state.scriptState)}},electricChars:"/{}:"}});CodeMirror.defineMIME("application/x-ejs",{name:"htmlembedded",scriptingModeSpec:"javascript"});CodeMirror.defineMIME("application/x-aspx",{name:"htmlembedded",scriptingModeSpec:"text/x-csharp"});CodeMirror.defineMIME("application/x-jsp",{name:"htmlembedded",scriptingModeSpec:"text/x-java"});(function(){function keywords(str){var obj={},words=str.split(" ");for(var i=0;i<words.length;++i)obj[words[i]]=true;return obj;}
function heredoc(delim){return function(stream,state){if(stream.match(delim))state.tokenize=null;else stream.skipToEnd();return"string";}}
var phpConfig={name:"clike",keywords:keywords("abstract and array as break case catch cfunction class clone const continue declare "+"default do else elseif enddeclare endfor endforeach endif endswitch endwhile extends "+"final for foreach function global goto if implements interface instanceof namespace "+"new or private protected public static switch throw try use var while xor return"+"die echo empty exit eval include include_once isset list require require_once print unset"),blockKeywords:keywords("catch do else elseif for foreach if switch try while"),atoms:keywords("true false null TRUE FALSE NULL"),multiLineStrings:true,hooks:{"$":function(stream,state){stream.eatWhile(/[\w\$_]/);return"variable-2";},"<":function(stream,state){if(stream.match(/<</)){stream.eatWhile(/[\w\.]/);state.tokenize=heredoc(stream.current().slice(3));return state.tokenize(stream,state);}
return false;},"#":function(stream,state){stream.skipToEnd();return"comment";}}};CodeMirror.defineMode("php",function(config,parserConfig){var htmlMode=CodeMirror.getMode(config,{name:"xml",htmlMode:true});var jsMode=CodeMirror.getMode(config,"javascript");var cssMode=CodeMirror.getMode(config,"css");var phpMode=CodeMirror.getMode(config,phpConfig);function dispatch(stream,state){if(state.curMode==htmlMode){var style=htmlMode.token(stream,state.curState);if(style=="meta"&&/^<\?/.test(stream.current())){state.curMode=phpMode;state.curState=state.php;state.curClose=/^\?>/;state.mode='php';}
else if(style=="tag"&&stream.current()==">"&&state.curState.context){if(/^script$/i.test(state.curState.context.tagName)){state.curMode=jsMode;state.curState=jsMode.startState(htmlMode.indent(state.curState,""));state.curClose=/^<\/\s*script\s*>/i;state.mode='javascript';}
else if(/^style$/i.test(state.curState.context.tagName)){state.curMode=cssMode;state.curState=cssMode.startState(htmlMode.indent(state.curState,""));state.curClose=/^<\/\s*style\s*>/i;state.mode='css';}}
return style;}
else if(stream.match(state.curClose,false)){state.curMode=htmlMode;state.curState=state.html;state.curClose=null;state.mode='html';return dispatch(stream,state);}
else return state.curMode.token(stream,state.curState);}
return{startState:function(){var html=htmlMode.startState();return{html:html,php:phpMode.startState(),curMode:parserConfig.startOpen?phpMode:htmlMode,curState:parserConfig.startOpen?phpMode.startState():html,curClose:parserConfig.startOpen?/^\?>/:null,mode:parserConfig.startOpen?'php':'html'}},copyState:function(state){var html=state.html,htmlNew=CodeMirror.copyState(htmlMode,html),php=state.php,phpNew=CodeMirror.copyState(phpMode,php),cur;if(state.curState==html)cur=htmlNew;else if(state.curState==php)cur=phpNew;else cur=CodeMirror.copyState(state.curMode,state.curState);return{html:htmlNew,php:phpNew,curMode:state.curMode,curState:cur,curClose:state.curClose};},token:dispatch,indent:function(state,textAfter){if((state.curMode!=phpMode&&/^\s*<\//.test(textAfter))||(state.curMode==phpMode&&/^\?>/.test(textAfter)))
return htmlMode.indent(state.html,textAfter);return state.curMode.indent(state.curState,textAfter);},electricChars:"/{}:"}});CodeMirror.defineMIME("application/x-httpd-php","php");CodeMirror.defineMIME("application/x-httpd-php-open",{name:"php",startOpen:true});CodeMirror.defineMIME("text/x-php",phpConfig);})();CodeMirror.runMode=function(string,modespec,callback){var mode=CodeMirror.getMode({indentUnit:4},modespec);var isNode=callback.nodeType==1;var brace=0;var linesdivbeg="<div class='codemirrornumbers'>";if(isNode){var node=callback,accum=[];callback=function(string,style){if(style)
accum.push("<span class=\"cm-"+CodeMirror.htmlEscape(style)+"\">"+CodeMirror.htmlEscape(string)+"</span>");else{if(string[0]=='&')
accum.push(string);else{if((string[0]==' ')||(string[0]=='\t')){var string2='';var i=0;while(i<string.length){if(string[i]==' ')
string2+='&nbsp;';else
string2+='&nbsp;&nbsp;&nbsp;&nbsp;';i++;}
accum.push(string2);}else
accum.push(CodeMirror.htmlEscape(string));}}}}
var lines=CodeMirror.splitLines(string),state=CodeMirror.startState(mode);accum.push("<pre>");for(var i=0,e=lines.length;i<e;++i){if(i){accum.push("</pre><pre>");linesdivbeg+="<pre>"+i+"</pre>";}
var stream=new CodeMirror.StringStream(lines[i]);while(!stream.eol()){var style=mode.token(stream,state);callback(stream.current(),style);stream.start=stream.pos;}}
if(isNode){linesdivbeg+="<pre>"+i+"</pre>";node.innerHTML=linesdivbeg+"</div><div class='codearea'>"+accum.join("")+"</div><div class='clear'></div>";}};function trim(string){return(string.replace(/\s/g,""));}
CodeMirror.defineMode("less",function(config){var indentUnit=config.indentUnit,type;function ret(style,tp){type=tp;return style;}
var tags=["a","abbr","acronym","address","applet","area","article","aside","audio","b","base","basefont","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","command","datalist","dd","del","details","dfn","dir","div","dl","dt","em","embed","fieldset","figcaption","figure","font","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","keygen","kbd","label","legend","li","link","map","mark","menu","meta","meter","nav","noframes","noscript","object","ol","optgroup","option","output","p","param","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strike","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","title","tr","track","tt","u","ul","var","video","wbr"];function inTagsArray(val){for(var i=0;i<tags.length;i++){if(val===tags[i]){return true;}}}
function tokenBase(stream,state){var ch=stream.next();if(ch=="@"){stream.eatWhile(/[\w\-]/);return ret("meta",stream.current());}
else if(ch=="/"&&stream.eat("*")){state.tokenize=tokenCComment;return tokenCComment(stream,state);}
else if(ch=="<"&&stream.eat("!")){state.tokenize=tokenSGMLComment;return tokenSGMLComment(stream,state);}
else if(ch=="=")ret(null,"compare");else if((ch=="~"||ch=="|")&&stream.eat("="))return ret(null,"compare");else if(ch=="\""||ch=="'"){state.tokenize=tokenString(ch);return state.tokenize(stream,state);}
else if(ch=="/"){if(stream.eat("/")){state.tokenize=tokenSComment
return tokenSComment(stream,state);}else{stream.eatWhile(/[\a-zA-Z0-9\-_.]/);return ret("number","unit");}}
else if(ch=="!"){stream.match(/^\s*\w*/);return ret("keyword","important");}
else if(/\d/.test(ch)){stream.eatWhile(/[\w.%]/);return ret("number","unit");}
else if(/[,+>*\/]/.test(ch)){return ret(null,"select-op");}
else if(/[;{}:\[\]()]/.test(ch)){if(ch==":"){stream.eatWhile(/[active|hover|link|visited]/);if(stream.current().match(/[active|hover|link|visited]/)){return ret("tag","tag");}else{return ret(null,ch);}}else{return ret(null,ch);}}
else if(ch=="."){stream.eatWhile(/[\a-zA-Z0-9\-_]/);return ret("tag","tag");}
else if(ch=="#"){stream.match(/([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/);if(stream.current().length>1){if(stream.current().match(/([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/)!=null){return ret("number","unit");}else{stream.eatWhile(/[\w\-]/);return ret("atom","tag");}}else{stream.eatWhile(/[\w\-]/);return ret("atom","tag");}}
else if(ch=="&"){stream.eatWhile(/[\w\-]/);return ret(null,ch);}
else{stream.eatWhile(/[\w\\\-_.%{]/);if(stream.eat("(")){return ret(null,ch);}else if(stream.current().match(/\-\d|\-.\d/)){return ret("number","unit");}else if(inTagsArray(stream.current())){return ret("tag","tag");}else{return ret("variable","variable");}}}
function tokenSComment(stream,state){stream.skipToEnd();state.tokenize=tokenBase;return ret("comment","comment");}
function tokenCComment(stream,state){var maybeEnd=false,ch;while((ch=stream.next())!=null){if(maybeEnd&&ch=="/"){state.tokenize=tokenBase;break;}
maybeEnd=(ch=="*");}
return ret("comment","comment");}
function tokenSGMLComment(stream,state){var dashes=0,ch;while((ch=stream.next())!=null){if(dashes>=2&&ch==">"){state.tokenize=tokenBase;break;}
dashes=(ch=="-")?dashes+1:0;}
return ret("comment","comment");}
function tokenString(quote){return function(stream,state){var escaped=false,ch;while((ch=stream.next())!=null){if(ch==quote&&!escaped)
break;escaped=!escaped&&ch=="\\";}
if(!escaped)state.tokenize=tokenBase;return ret("string","string");};}
return{startState:function(base){return{tokenize:tokenBase,baseIndent:base||0,stack:[]};},token:function(stream,state){if(stream.eatSpace())return null;var style=state.tokenize(stream,state);var context=state.stack[state.stack.length-1];if(type=="hash"&&context=="rule")style="atom";else if(style=="variable"){if(context=="rule")style=null;else if(!context||context=="@media{")style="tag";}
if(context=="rule"&&/^[\{\};]$/.test(type))
state.stack.pop();if(type=="{"){if(context=="@media")state.stack[state.stack.length-1]="@media{";else state.stack.push("{");}
else if(type=="}")state.stack.pop();else if(type=="@media")state.stack.push("@media");else if(context=="{"&&type!="comment")state.stack.push("rule");return style;},indent:function(state,textAfter){var n=state.stack.length;if(/^\}/.test(textAfter))
n-=state.stack[state.stack.length-1]=="rule"?2:1;return state.baseIndent+n*indentUnit;},electricChars:"}"};});CodeMirror.defineMIME("text/less","less");

/*
 *	MySQL Mode for CodeMirror 2 by MySQL-Tools
 *	@author James Thorne (partydroid)
 *	@link 	http://github.com/partydroid/MySQL-Tools
 * 	@link 	http://mysqltools.org
 *	@version 02/Jan/2012
*/
CodeMirror.defineMode("mysql", function(config) {
  var indentUnit = config.indentUnit;
  var curPunc;

  function wordRegexp(words) {
    return new RegExp("^(?:" + words.join("|") + ")$", "i");
  }
  var ops = wordRegexp(["str", "lang", "langmatches", "datatype", "bound", "sameterm", "isiri", "isuri",
                        "isblank", "isliteral", "union", "a"]);
  var keywords = wordRegexp([
  	('ACCESSIBLE'),('ALTER'),('AS'),('BEFORE'),('BINARY'),('BY'),('CASE'),('CHARACTER'),('COLUMN'),('CONTINUE'),('CROSS'),('CURRENT_TIMESTAMP'),('DATABASE'),('DAY_MICROSECOND'),('DEC'),('DEFAULT'),
	('DESC'),('DISTINCT'),('DOUBLE'),('EACH'),('ENCLOSED'),('EXIT'),('FETCH'),('FLOAT8'),('FOREIGN'),('GRANT'),('HIGH_PRIORITY'),('HOUR_SECOND'),('IN'),('INNER'),('INSERT'),('INT2'),('INT8'),
	('INTO'),('JOIN'),('KILL'),('LEFT'),('LINEAR'),('LOCALTIME'),('LONG'),('LOOP'),('MATCH'),('MEDIUMTEXT'),('MINUTE_SECOND'),('NATURAL'),('NULL'),('OPTIMIZE'),('OR'),('OUTER'),('PRIMARY'),
	('RANGE'),('READ_WRITE'),('REGEXP'),('REPEAT'),('RESTRICT'),('RIGHT'),('SCHEMAS'),('SENSITIVE'),('SHOW'),('SPECIFIC'),('SQLSTATE'),('SQL_CALC_FOUND_ROWS'),('STARTING'),('TERMINATED'),
	('TINYINT'),('TRAILING'),('UNDO'),('UNLOCK'),('USAGE'),('UTC_DATE'),('VALUES'),('VARCHARACTER'),('WHERE'),('WRITE'),('ZEROFILL'),('ALL'),('AND'),('ASENSITIVE'),('BIGINT'),('BOTH'),('CASCADE'),
	('CHAR'),('COLLATE'),('CONSTRAINT'),('CREATE'),('CURRENT_TIME'),('CURSOR'),('DAY_HOUR'),('DAY_SECOND'),('DECLARE'),('DELETE'),('DETERMINISTIC'),('DIV'),('DUAL'),('ELSEIF'),('EXISTS'),('FALSE'),
	('FLOAT4'),('FORCE'),('FULLTEXT'),('HAVING'),('HOUR_MINUTE'),('IGNORE'),('INFILE'),('INSENSITIVE'),('INT1'),('INT4'),('INTERVAL'),('ITERATE'),('KEYS'),('LEAVE'),('LIMIT'),('LOAD'),('LOCK'),
	('LONGTEXT'),('MASTER_SSL_VERIFY_SERVER_CERT'),('MEDIUMINT'),('MINUTE_MICROSECOND'),('MODIFIES'),('NO_WRITE_TO_BINLOG'),('ON'),('OPTIONALLY'),('OUT'),('PRECISION'),('PURGE'),('READS'),
	('REFERENCES'),('RENAME'),('REQUIRE'),('REVOKE'),('SCHEMA'),('SELECT'),('SET'),('SPATIAL'),('SQLEXCEPTION'),('SQL_BIG_RESULT'),('SSL'),('TABLE'),('TINYBLOB'),('TO'),('TRUE'),('UNIQUE'),
	('UPDATE'),('USING'),('UTC_TIMESTAMP'),('VARCHAR'),('WHEN'),('WITH'),('YEAR_MONTH'),('ADD'),('ANALYZE'),('ASC'),('BETWEEN'),('BLOB'),('CALL'),('CHANGE'),('CHECK'),('CONDITION'),('CONVERT'),
	('CURRENT_DATE'),('CURRENT_USER'),('DATABASES'),('DAY_MINUTE'),('DECIMAL'),('DELAYED'),('DESCRIBE'),('DISTINCTROW'),('DROP'),('ELSE'),('ESCAPED'),('EXPLAIN'),('FLOAT'),('FOR'),('FROM'),
	('GROUP'),('HOUR_MICROSECOND'),('IF'),('INDEX'),('INOUT'),('INT'),('INT3'),('INTEGER'),('IS'),('KEY'),('LEADING'),('LIKE'),('LINES'),('LOCALTIMESTAMP'),('LONGBLOB'),('LOW_PRIORITY'),
	('MEDIUMBLOB'),('MIDDLEINT'),('MOD'),('NOT'),('NUMERIC'),('OPTION'),('ORDER'),('OUTFILE'),('PROCEDURE'),('READ'),('REAL'),('RELEASE'),('REPLACE'),('RETURN'),('RLIKE'),('SECOND_MICROSECOND'),
	('SEPARATOR'),('SMALLINT'),('SQL'),('SQLWARNING'),('SQL_SMALL_RESULT'),('STRAIGHT_JOIN'),('THEN'),('TINYTEXT'),('TRIGGER'),('UNION'),('UNSIGNED'),('USE'),('UTC_TIME'),('VARBINARY'),('VARYING'),
	('WHILE'),('XOR'),('FULL'),('COLUMNS'),('MIN'),('MAX'),('STDEV'),('COUNT')
  ]);
  var operatorChars = /[*+\-<>=&|]/;

  function tokenBase(stream, state) {
    var ch = stream.next();
    curPunc = null;
    if (ch == "$" || ch == "?") {
      stream.match(/^[\w\d]*/);
      return "variable-2";
    }
    else if (ch == "<" && !stream.match(/^[\s\u00a0=]/, false)) {
      stream.match(/^[^\s\u00a0>]*>?/);
      return "atom";
    }
    else if (ch == "\"" || ch == "'") {
      state.tokenize = tokenLiteral(ch);
      return state.tokenize(stream, state);
    }
    else if (ch == "`") {
      state.tokenize = tokenOpLiteral(ch);
      return state.tokenize(stream, state);
    }
    else if (/[{}\(\),\.;\[\]]/.test(ch)) {
      curPunc = ch;
      return null;
    }
    else if (ch == "-") {
		ch2 = stream.next();
		if(ch2=="-")
		{
			stream.skipToEnd();
			return "comment";
		}

    }
    else if (operatorChars.test(ch)) {
      stream.eatWhile(operatorChars);
      return null;
    }
    else if (ch == ":") {
      stream.eatWhile(/[\w\d\._\-]/);
      return "atom";
    }
    else {
      stream.eatWhile(/[_\w\d]/);
      if (stream.eat(":")) {
        stream.eatWhile(/[\w\d_\-]/);
        return "atom";
      }
      var word = stream.current(), type;
      if (ops.test(word))
        return null;
      else if (keywords.test(word))
        return "keyword";
      else
        return "variable";
    }
  }

  function tokenLiteral(quote) {
    return function(stream, state) {
      var escaped = false, ch;
      while ((ch = stream.next()) != null) {
        if (ch == quote && !escaped) {
          state.tokenize = tokenBase;
          break;
        }
        escaped = !escaped && ch == "\\";
      }
      return "string";
    };
  }

  function tokenOpLiteral(quote) {
    return function(stream, state) {
      var escaped = false, ch;
      while ((ch = stream.next()) != null) {
        if (ch == quote && !escaped) {
          state.tokenize = tokenBase;
          break;
        }
        escaped = !escaped && ch == "\\";
      }
      return "variable-2";
    };
  }


  function pushContext(state, type, col) {
    state.context = {prev: state.context, indent: state.indent, col: col, type: type};
  }
  function popContext(state) {
    state.indent = state.context.indent;
    state.context = state.context.prev;
  }

  return {
    startState: function(base) {
      return {tokenize: tokenBase,
              context: null,
              indent: 0,
              col: 0};
    },

    token: function(stream, state) {
      if (stream.sol()) {
        if (state.context && state.context.align == null) state.context.align = false;
        state.indent = stream.indentation();
      }
      if (stream.eatSpace()) return null;
      var style = state.tokenize(stream, state);

      if (style != "comment" && state.context && state.context.align == null && state.context.type != "pattern") {
        state.context.align = true;
      }

      if (curPunc == "(") pushContext(state, ")", stream.column());
      else if (curPunc == "[") pushContext(state, "]", stream.column());
      else if (curPunc == "{") pushContext(state, "}", stream.column());
      else if (/[\]\}\)]/.test(curPunc)) {
        while (state.context && state.context.type == "pattern") popContext(state);
        if (state.context && curPunc == state.context.type) popContext(state);
      }
      else if (curPunc == "." && state.context && state.context.type == "pattern") popContext(state);
      else if (/atom|string|variable/.test(style) && state.context) {
        if (/[\}\]]/.test(state.context.type))
          pushContext(state, "pattern", stream.column());
        else if (state.context.type == "pattern" && !state.context.align) {
          state.context.align = true;
          state.context.col = stream.column();
        }
      }

      return style;
    },

    indent: function(state, textAfter) {
      var firstChar = textAfter && textAfter.charAt(0);
      var context = state.context;
      if (/[\]\}]/.test(firstChar))
        while (context && context.type == "pattern") context = context.prev;

      var closing = context && firstChar == context.type;
      if (!context)
        return 0;
      else if (context.type == "pattern")
        return context.col;
      else if (context.align)
        return context.col + (closing ? 0 : 1);
      else
        return context.indent + (closing ? 0 : indentUnit);
    }
  };
});

CodeMirror.defineMIME("text/x-mysql", "mysql");
