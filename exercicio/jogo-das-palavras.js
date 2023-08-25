const ANSWER_LENGTH = 5;
const ROUNDS = 6;
const letters = document.querySelectorAll(".letter");
const loadingDiv = document.querySelector(".info-bar");

// init async function, so I can use "await"
async function init(){
    // the state of the app
    let currentRow = 0;
    let currentGuess = "";
    let done = false;
    let isLoading = true;

    //nad the word of the day
    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const { word: wordRes } = await res.json();
    const word = wordRes.toUpperCase();
    const wordParts = word.split("");
    isLoading = false;
    setLoading(isLoading);

    // adding letter to the current guess
    function addLetter(letter){
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
        } else {
            current = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }
        letter[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText = letter;
    }

    // tries to enter a gues
    async function commit() {
        if (currentGuess.length !== ANSWER_LENGTH){
            // do nothing
            return;
        }

        // check the API to see if it's a valid word
        isLoading = true;
        setLoading(isLoading);
        const res = await  fetch("https://words.dev-apis.com/validate-word",
            { method: "POST", body: JSON.stringify({ word: currentGuess}),});
        const { validWord } =  await res.json();
        isLoading = false;
        setLoading(isLoading);

        // if invalid, mark as invalid and return
        if (!validWord){
            markInvalidWord();
            return;
        }

        const guessParts = currentGuess.split("");
        const map = makeMap(wordParts);
        let allRight = true;

        // first pass just finds correct letters
        for ( let i = 0; i < ANSWER_LENGTH; i++){
            if (guessParts[i] === wordParts[i]){
                // Mark as correct
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                map[guessParts[i]]--;
            }
        }

        // secund pass finds close and wrong letters
        for (let i = 0; i < ANSWER_LENGTH; i++){
            if (guessParts[i] === wordParts[i]){
                // do nothiing
            }else if (map[guessParts[i]] && map[guessParts[i]] > 0){
                // mark as close
                allRight = false;
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
                map[guessParts[i]]--;
            }else{
                // wrong
                allRight = false;
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
            }
        }

        currentRow++;
        currentGuess = "";
        if (allRight){
            // win
            alert("Você ganhou!");
            document.querySelector(".brand").classList.add("winner");
            done = true;
        }else if (currentRow === ROUNDS){
            // lose
            alert(`Voce perdeu, a palavra é ${word}`);
            done = true;
        }
    }

    // user hits backspace, if the length of the string is 0 then do nothinf
    function backspace(){
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = "";
    }

    // let the user know that their guess wasn't a real word
    function markInvalidWord() {
        for (let i = 0; i < ANSWER_LENGTH; i++){
            letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

            setTimeout(
                () => letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid"), 10
            );
        }
    }

    // listening for event keys and routing to the right function
    document.addEventListener("keydown", function handleKey(event){
        if (done || isLoading){
            // do nothing
            return;
        }

        const action = event.key;

        if (action === "Enter"){
            commit();
        }else if (action === "Backspace"){
            backspace();
        }else if (isLetter(action)){
            addLetter(action.toUpperCase());
        }else{
            // do nothing
        }
    });
}


// a little function to check to see if a character is alphabet letter
// uses regex (the /[a-zA-Z]/ part)
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

// show spinner when needed
function setLoading(isLoading) {
    loadingDiv.classList.toggle("hidden", !isLoading);
}


// takes an array of letters (like ['E', 'L', 'I', 'T', 'E']) and creates
// an object out of it (like {E: 2, L: 1, T: 1}) so we can use that to
// make sure we get the correct amount of letters marked close instead
// of just wrong or correct

function makeMap(array){
    const obj = {};
    for (let i = 0; i < array.length; i++){
        if (obj[array[i]]){
            obj[array[i]]++;
        }else{
            obj[array[i]] = 1;
        }
    }
    return obj;
}

init();