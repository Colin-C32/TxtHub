import './Wordle.scss';
import React, {useState} from 'react';
import Layout from '../Layout';
import {FaBackspace, FaRedo} from 'react-icons/fa';
import {GiCancel} from 'react-icons/gi';
import {AiOutlineQuestionCircle} from 'react-icons/ai';

import axios from "axios";

import Instructions from './Instructions';
import Backdrop from './Backdrop';
import Message from './Message';


var guessPosition = 0; 
var currentWord = [];
var guessedWords = [];
var answer = setWord(); // just declare answer don't set it to anything tho

async function setWord(){
    await axios.get('http://localhost:8082/wordle/api/v1/getword')
        .then(res => {
            answer = res.data
            console.log(res.data)
        });
}


function Wordle(){

    const [notEnoughLetters, setNotEnoughLetters] = useState(false);
    const [notWord, setNotWord] = useState(false);
    const [finishedSuccessfully, setFinishedSuccessfully] = useState(false);
    const [finishedWrong, setFinishedWrong] = useState(false);
    const [instructions, setInstructions] = useState(true);

    function addLetter(a)
    {   
        if(finishedSuccessfully || finishedWrong){
            return;
        }
        setNotEnoughLetters(false);
        setNotWord(false);
        if(currentWord.length > 4){
            return;
        }
        
        currentWord.push(a);
        const box = document.getElementById(guessPosition);
        box.textContent = a;
        guessPosition++; 


    }

    function removeLetter(){
        setNotEnoughLetters(false);
        setNotWord(false);
        if(guessPosition <= guessedWords.length * 5){
            return;
        }
        if (guessPosition > 0){
            guessPosition--;
        }
        let b = '';
        currentWord.pop(); 
        const box = document.getElementById(guessPosition);
        box.textContent = b;
    }



    async function addWord(){
        setNotEnoughLetters(false);
        setNotWord(false);

        if(currentWord.length < 5){

            setNotEnoughLetters(true);
            return;
        }

        let test
        let request = 'http://localhost:8082/wordle/api/v1/testword/' + currentWord.join("")
        console.log(request)
        await axios.get(request)
            .then(res => {
                console.log(res.data)
                test =  res.data
        })
        console.log(test)
        if(test === false){
            setNotWord(true);
            return;
        }



        const map = new Map();
        const duplicates = [];
        var str ="";

        for(let i = 0; i < currentWord.length; i++){
            str+= currentWord[i];
            if(currentWord[i] === answer.charAt(i)){
                if(map.get(currentWord[i]) !== undefined){
                    duplicates.push(currentWord.indexOf(str.charAt(str.length -1)));
                }
                map.set(answer.charAt(i), 'g');
            }else{
                if(map.get(currentWord[i]) === undefined){
                    map.set(currentWord[i], 'x');
                }else{
                    duplicates.push(i);
                }

            }

        }

        for(let i = 0; i < answer.length; i++){
            if(map.get(answer.charAt(i)) !== undefined && map.get(answer.charAt(i)) !== 'g'){
                map.set(answer.charAt(i), 'y');
            }
        }

        for(let  i =0; i < currentWord.length; i++){

            const box = document.getElementById(guessPosition - 5 + i);
            const letter = document.getElementById(currentWord[i]);

            var char = currentWord[i];

            if(map.get(char) === 'g'){
                box.style.backgroundColor = 'lightgreen';
                letter.style.backgroundColor = 'lightgreen';
            }else if(map.get(char) === 'y'){
                box.style.backgroundColor = 'yellow';

                if(letter.style.backgroundColor !== 'lightgreen'){
                    letter.style.backgroundColor = 'yellow';
                }

            }else{
                box.style.backgroundColor = 'grey';
                letter.style.backgroundColor = 'grey';
            }
        }
        for(let i = 0; i < duplicates.length; i++){
            const box = document.getElementById(guessPosition - 5 + duplicates[i]);


            if(answer.split(currentWord[duplicates[i]]).length-1 > 1){

                if(currentWord[duplicates[i]] === answer.charAt(duplicates[i])){
                    box.style.backgroundColor = 'lightgreen';
                }else{
                    box.style.backgroundColor = 'yellow';
                }
            }else{
                box.style.backgroundColor = 'grey';
            }

        }
        guessedWords.push(currentWord);

        if(currentWord.join('') === answer){
            setFinishedSuccessfully(true);

        }else if(guessedWords.length === 6){
            setFinishedWrong(true);
        }
        currentWord = [];
    }

    function playAgain(){

        for(let i = 0; i < guessedWords.length; i++){
            var p = guessedWords[i];
            for(let j = 0; j < p.length; j++){
                const l = document.getElementById(p[j]);
                l.style.backgroundColor = '#d3d6da';
            }
        }
        

        while(guessPosition > -1){
            let b = ''; 
            const box = document.getElementById(guessPosition);
            box.textContent = b;
            box.style.backgroundColor = 'white';
            guessPosition--;
        }
        guessPosition = 0;
        guessedWords = [];
        setFinishedSuccessfully(false);
        setFinishedWrong(false);    
        setNotEnoughLetters(false);
        setNotWord(false);
        
        setWord();
    }
    
    const changeInstructions = () => setInstructions(!instructions);
    var arr = new Array(30).fill(null);
    return(
        <div>
            
            <h1 className="game-name">Wordle <AiOutlineQuestionCircle className='help' onClick = {changeInstructions}/></h1>
            <hr/>
            

            {notEnoughLetters && <Message title='Not long enough.'/>}
            {notWord && <Message title = 'Not in word list.'/>}
            {finishedSuccessfully && <Message title= 'Good Job!' again='Play again?'  handler={playAgain} button={<FaRedo size = {20}/> }/>}
            {finishedWrong && <Message title= 'Nice Try :(' again='Play again?' handler={playAgain} button={<FaRedo size = {20}/> }/>}
            {instructions && <Instructions button={<GiCancel/>} handler={changeInstructions}/>}
            {instructions && <Backdrop onCancel={changeInstructions}/>}

            <div id='board-container'>
            <div id='board'> 
                    {arr.map(function(arr, index){
                        return <div class="square animate__animated" id={index}></div>
                    })}
                
                </div>
            </div>
            
            <div id="keyboard">

                <div className='row'>
                    <button onClick= { () => addLetter('q') }data-key='q' id='q'>q</button>
                    <button onClick= { () => addLetter('w') }data-key='w' id='w'>w</button>
                    <button onClick= { () => addLetter('e') }data-key='e' id='e'>e</button>
                    <button onClick= { () => addLetter('r') }data-key='r' id='r'>r</button>
                    <button onClick= { () => addLetter('t') }data-key='t' id='t'>t</button>
                    <button onClick= { () => addLetter('y') }data-key='y' id='y'>y</button>
                    <button onClick= { () => addLetter('u') }data-key='u' id='u'>u</button>
                    <button onClick= { () => addLetter('i') }data-key='i' id='i'>i</button>
                    <button onClick= { () => addLetter('o') }data-key='o' id='o'>o</button>
                    <button onClick= { () => addLetter('p') }data-key='p' id='p'>p</button>

                </div>
                
                <div className='row'>
                    <button onClick= { () => addLetter('a') } data-key='a' id='a'>a</button>
                    <button onClick= { () => addLetter('s') } data-key='s' id='s'>s</button>
                    <button onClick= { () => addLetter('d') } data-key='d' id='d'>d</button>
                    <button onClick= { () => addLetter('f') } data-key='f' id='f'>f</button>
                    <button onClick= { () => addLetter('g') } data-key='g' id='g'>g</button>
                    <button onClick= { () => addLetter('h') } data-key='h' id='h'>h</button>
                    <button onClick= { () => addLetter('j') } data-key='j' id='j'>j</button>
                    <button onClick= { () => addLetter('k') } data-key='k' id='k'>k</button>
                    <button onClick= { () => addLetter('l') } data-key='l' id='l'>l</button>
                    
                </div>
                
                <div className='row'>
                    <button onClick= { () => addWord() } data-key='enter' className='one-and-a-half'>enter</button>
                    <button onClick= { () => addLetter('z') } data-key='z' id='z'>z</button>
                    <button onClick= { () => addLetter('x') } data-key='x' id='x'>x</button>
                    <button onClick= { () => addLetter('c') } data-key='c' id='c'>c</button>
                    <button onClick= { () => addLetter('v') } data-key='v' id='v'>v</button>
                    <button onClick= { () => addLetter('b') } data-key='b' id='b'>b</button>
                    <button onClick= { () => addLetter('n') } data-key='n' id='n'>n</button>
                    <button onClick= { () => addLetter('m') } data-key='m' id='m'>m</button>
                    <button onClick= { () => removeLetter() } data-key='backspace' className='one-and-a-half'><FaBackspace size={20} /></button>
                </div>
            </div>
                

        </div>
    )
}

export default Wordle;