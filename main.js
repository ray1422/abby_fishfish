var util = util || {};
util.toArray = function(list) {
  return Array.prototype.slice.call(list || [], 0);
};

var Terminal = Terminal || function(cmdLineContainer, outputContainer) {
  window.URL = window.URL || window.webkitURL;
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

  var cmdLine_ = document.querySelector(cmdLineContainer);
  var output_ = document.querySelector(outputContainer);

  const CMDS_ = [
    'unlock', 'photo', 'build', 'cat', 'clear', 'clock', 'date', 'echo', 'help', 'uname', 'ls', 'screenfetch', 'neofetch'
  ].sort();
  
  var fs_ = null;
  var cwd_ = null;
  var history_ = [];
  var histpos_ = 0;
  var histtemp_ = 0;
  var unlocked = false;
  window.addEventListener('click', function(e) {
    cmdLine_.focus();
  }, false);

  cmdLine_.addEventListener('click', inputTextClick_, false);
  cmdLine_.addEventListener('keydown', historyHandler_, false);
  cmdLine_.addEventListener('keydown', processNewCommand_, false);
  cmdLine_.addEventListener('keydown', cls_, false);

  var ctrlPressed = false;
  //
  function cls_(e){
    if(e.keyCode == 17) ctrlPressed = true;
    else {
        if(e.keyCode == 76 && ctrlPressed) {
            output_.innerHTML = '';
            e.preventDefault();
        }
        ctrlPressed = false;
    }
  }

  //
  function inputTextClick_(e) {
    this.value = this.value;
  }

  //
  function historyHandler_(e) {
    if (history_.length) {
      if (e.keyCode == 38 || e.keyCode == 40) {
        if (history_[histpos_]) {
          history_[histpos_] = this.value;
        } else {
          histtemp_ = this.value;
        }
      }

      if (e.keyCode == 38) { // up
        histpos_--;
        if (histpos_ < 0) {
          histpos_ = 0;
        }
      } else if (e.keyCode == 40) { // down
        histpos_++;
        if (histpos_ > history_.length) {
          histpos_ = history_.length;
        }
      }

      if (e.keyCode == 38 || e.keyCode == 40) {
        this.value = history_[histpos_] ? history_[histpos_] : histtemp_;
        this.value = this.value; // Sets cursor to end of input.
        
      }
    }
  }

  //
  function processNewCommand_(e) {

    if (e.keyCode == 9) { // tab
      e.preventDefault();
      // Implement tab suggest.
    } else if (e.keyCode == 13) { // enter
      // Save shell history.
      if (this.value) {
        history_[history_.length] = this.value;
        histpos_ = history_.length;
      }

      // Duplicate current input and append to output section.
      var line = this.parentNode.parentNode.cloneNode(true);
      line.removeAttribute('id')
      line.classList.add('line');
      var input = line.querySelector('input.cmdline');
      input.autofocus = false;
      input.readOnly = true;
      output_.appendChild(line);

      if (this.value && this.value.trim()) {
        var args = this.value.split(' ').filter(function(val, i) {
          return val;
        });
        var cmd = args[0].toLowerCase();
        args = args.splice(1); // Remove cmd from arg list.
      }

      switch (cmd) {
        case 'ls':
            output('<span class="error">❤️❤️❤️❤️❤️</span>');
            break;
        case 'photo':
            if(!unlocked) {
                output("<span class='error'>錯誤：您需要先解鎖。</span>");
            } else {
                const eid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                output('<p id="' + eid + '"><img class="photo" src="" id="' + eid + '_img"></p>');
                setRandImg(eid);
            }
            break;
        case 'unlock':
            var password = args.join(' ');
            if(unlocked) {
                output('不需要，您已經解鎖了。'); break;
            }
            if(!password) {
                output('Usage: unlock &lt;your password here&gt;');
            } else if (sha256(sha256(password) + 'Abby<3Ray') != 'a236873bd652a7f0f25b56e255bfc2941eb7e8d08a401347881545ad9cd849f1') {
                sleep(1500)
                output("<span class='warn'>Wrong Password!</span>");
            } else {
                unlocked = true;
                output(
                       '::::::::::::::::::::::::<br />' + 
                       ':::::: UNLOCKED!! ::::::<br />' + 
                       '::::::::::::::::::::::::<br />');
            }
            break;
        case 'build':
            var parm = args.join(' ');
            if(parm == 'snowman') {
                output("Do you want to build a snowman?")
                $("#frozen")[0].play()
                $.get("assets/asciiart/snowman.txt", function(data){
                    output($("<div>").text(data).html().replace(/\n/g, "<br />"));
                })

            }
            break;
        case 'cat':
          var url = args.join(' ');
          if (!url) {
            output('Usage: ' + cmd + ' https://ray1422.github.io/...');
            output('Example: ' + cmd + ' https://ray1422.github.io/');
            break;
          }
          $.get( url, function(data) {
            var encodedStr = data.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
               return '&#'+i.charCodeAt(0)+';';
            });
            output('<pre>' + encodedStr + '</pre>');
          });          
          break;
        case 'screenfetch':case 'neofetch':
          $.get( './assets/asciiart/screenfetch.txt', function(data) {
            var encodedStr = data.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#'+i.charCodeAt(0)+';';
            });
            output('<pre>' + encodedStr + '</pre>');
            $("#dingdong")[0].play();
          });          
          break;
        case 'clear':
          output_.innerHTML = '';
          this.value = '';
          return;
        case 'clock':
          var appendDiv = jQuery($('.clock-container')[0].outerHTML);
          appendDiv.attr('style', 'display:inline-block');
          output_.appendChild(appendDiv[0]);
          break;
        case 'date':
          output( new Date() );
          break;
        case 'echo':
          output( args.join(' ') );
          break;
        case 'help':case '?':
          output('<div class="ls-files">' + CMDS_.join('<br>') + '</div>');
          break;
        case 'uname':
          output(navigator.userAgent);
          break;
       
        default:
          if (cmd) {
            output(cmd + ': command not found');
          }
      };

      window.scrollTo(0, getDocHeight_());
      this.value = ''; // Clear/setup line for next input.
    }
  }

  //
  function formatColumns_(entries) {
    var maxName = entries[0].name;
    util.toArray(entries).forEach(function(entry, i) {
      if (entry.name.length > maxName.length) {
        maxName = entry.name;
      }
    });

    var height = entries.length <= 3 ?
        'height: ' + (entries.length * 15) + 'px;' : '';

    // 12px monospace font yields ~7px screen width.
    var colWidth = maxName.length * 7;

    return ['<div class="ls-files" style="-webkit-column-width:',
            colWidth, 'px;', height, '">'];
  }

  //
  function output(html) {
    output_.insertAdjacentHTML('beforeEnd', '<p>' + html + '</p>');
    $(document).scrollTop($(document).height());
  }

  // Cross-browser impl to get document's height.
  function getDocHeight_() {
    var d = document;
    return Math.max(
        Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
        Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
        Math.max(d.body.clientHeight, d.documentElement.clientHeight)
    );
  }

  //
  return {
    init: function() {
      output('<h2 style="letter-spacing: 4px; margin-top: -1rem;">魚魚跟胖胖的小屋</h2><p>輸入 help 以獲得更多說明。</p>');
    },
    output: output
  }
};
const images_src = ['assets/photo/Hsinchu_Station.jpg'];
var images = [];
for(var i = 0 ; i < images_src.length; i++) {
    images[i] = new Image();
    images[i].src = images_src[i];
}
function setRandImg(eid) {
    const idx = ~~(Math.random() * images.length);
    $("#" + eid + " img").attr('src', images[idx].src);
}
function sleep(milliseconds)  { 
    var start = new Date().getTime(); 
    while(1){
        if ((new Date().getTime() - start) > milliseconds) break;
    }
}