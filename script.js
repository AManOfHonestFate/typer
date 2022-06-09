import randomWords from "./random_words.js"

// const w = await fetch('https://random-word-api.herokuapp.com/word?number=15');
// let text = undefined;
// await w.json().then((t) => {
//     text = t;
// })

const body = document.querySelector('body');
body.style.opacity = 1;

const typer = document.querySelector('.typer');
const focus = document.querySelector('.focus');

let words = [];
const time = document.querySelector('.timer');
time.textContent = '0';

let t = 0;
let timerId = null;
let resultsId = null;
function timer() {
   
    timerId = setInterval(() => {
        if (!type.ended) {
            t++;
            if (t < 60) {
                time.textContent = t;
            } else {
                const seconds = t % 60;
                time.textContent = `${Math.floor(t / 60)}:${seconds >= 10 ? seconds : '0' + seconds}`
            }
        }
    }, 1000);
}

const line = document.createElement('div');
line.textContent = '|';
line.classList.add('line');

let wordEnded = false;
let type = {
    started: false,
    ended: false
}
let charsAdded = 0;
let wordCount = 0;
let letterCount = 0;

const charCounters = document.querySelectorAll('.counter:first-child b');
const wordCounters = document.querySelectorAll('.counter:last-child b');

function generateWords(number) {

    function resetAll() {
        wordEnded = false;
        type = {
            started: false,
            ended: false
        }
        charsAdded = 0;
        wordCount = 0;
        letterCount = 0;
        t = 0;
        clearInterval(timerId);
        clearInterval(resultsId);
        time.textContent = 0;
        charCounters.forEach((elem) => {
            elem.textContent = 0;
        })
        wordCounters.forEach((elem) => {
            elem.textContent = 0;
        })

        focus.textContent = 'Click here to focus'
    }

    typer.innerHTML = '';
    let text = randomWords(number);

    text.forEach((str) => {
        const wordElem = document.createElement('div');
        wordElem.classList.add('word');

        str += ' ';
        str.split('').forEach((letter) => {
            const letterElem = document.createElement('div');
            letterElem.textContent = letter;
            letterElem.classList.add('base-color', 'letter');
            wordElem.appendChild(letterElem);
        })
        typer.appendChild(wordElem);
    })

    words = document.querySelectorAll('.word:not(.space)');
    line.parentElement?.remove(line);
    words[0].children[0].appendChild(line);
    resetAll();
}

const buttonsNumberOfWords = document.querySelectorAll('.word-count li')

function changeNumberOfWords(elem) {
    const number = Number(elem.textContent);
    buttonsNumberOfWords.forEach((elem) => {
        elem.classList.remove('selected');
    })
    elem.classList.add('selected');
    generateWords(number);
}

buttonsNumberOfWords.forEach((elem) => {
    elem.addEventListener('click', () => {
        changeNumberOfWords(elem);
    });
})

generateWords(15);

typer.addEventListener('keydown', (e) => {

    if (type.ended) return;

    if (!type.started) {
        timer();
        type.started = true;
        
    }

    if (e.key === 'Backspace') {
        if (letterCount === 0) return;
        if (wordEnded) {
            if (charsAdded) {
                charsAdded--;
                words[wordCount].removeChild(words[wordCount].childNodes[words[wordCount].childElementCount - 2]);
                return;
            } else {
                wordEnded = false;
            }
        }

        words[wordCount].children[letterCount].removeChild(line);
        letterCount--;

        charCounters[0].textContent--;
        if ( words[wordCount].children[letterCount].classList.contains('correct')) {
            words[wordCount].children[letterCount].classList.remove('correct');
            charCounters[1].textContent--;
        } else {
            words[wordCount].children[letterCount].classList.remove('wrong');
            charCounters[2].textContent--;
        }

        words[wordCount].children[letterCount].appendChild(line);
    } else {

        if (wordEnded) {

            if (e.key === ' ') {
                letterCount = 0;
                charsAdded = 0;
                wordCount++;
                wordEnded = false;
                words[wordCount].children[letterCount].appendChild(line);

                wordCounters[0].textContent++;
                let wrong = false;
                for (let child of words[wordCount - 1].children) {
                    if (child.classList.contains('wrong')) {
                        wrong = true;
                        break;
                    }
                }
                wordCounters[wrong ? 2 : 1].textContent++;
                return;
            }

            if (charsAdded < 15) {
                if (!(e.key >= 'a' && e.key <= 'z') && e.key !== ' ') return;
                charsAdded++;
                const wrongChar = document.createElement('div');
                wrongChar.classList.add('letter', 'wrong');
                wrongChar.textContent = e.key;
                words[wordCount].lastChild.before(wrongChar);
            }
        } else {

            if (e.key == words[wordCount].children[letterCount].textContent[0]) {
                words[wordCount].children[letterCount].classList.add('correct');
                charCounters[1].textContent++;
            } else {
                words[wordCount].children[letterCount].classList.add('wrong');
                charCounters[2].textContent++;
            }
            charCounters[0].textContent++;
            words[wordCount].children[letterCount].removeChild(line);
            letterCount++;
            words[wordCount].children[letterCount].appendChild(line);
            if (letterCount + 1 === words[wordCount].childElementCount) {
                wordEnded = true;
            }

            if (wordEnded && wordCount + 1 === words.length) {
                type.ended = true;;
                letterCount = 0;
                charsAdded = 0;
                wordCount++;
                wordEnded = false;

                wordCounters[0].textContent++;
                let wrong = false;
                for (let child of words[wordCount - 1].children) {
                    if (child.classList.contains('wrong')) {
                        wrong = true;
                        break;
                    }
                }
                wordCount = 0;
                wordCounters[wrong ? 2 : 1].textContent++;
                results();
            }
        }
    }
})

function results() {
    const numberOfWordsText = `${(charCounters[1].textContent / (t / 60)).toFixed(1)} characters per minute`;
    let toggle = false;focus.textContent = numberOfWordsText;
    resultsId = setInterval(() => {
        if (toggle) {
            focus.textContent = numberOfWordsText;
        } else {
            focus.textContent = 'press TAB to restart';
        }
        toggle = !toggle;
    }, 2500);
    typer.blur();
}

typer.addEventListener('focus', () => {
    focus.style.display = 'none';
    focus.style.opacity = 0;
})

typer.addEventListener('blur', () => {
    focus.style.display = 'block';
    setTimeout(() => {
        focus.style.opacity = 1;
    }, 600);
})

focus.addEventListener('click', () => {
    typer.focus();
})

body.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (e.key === 'Tab') {
        clearInterval(resultsId);
        generateWords(words.length);
        typer.focus();
    }
})