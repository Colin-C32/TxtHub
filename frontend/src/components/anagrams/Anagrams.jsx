import './Anagrams.scss';
import React, {useState, useEffect, useContext, useCallback} from 'react';
import {FaBackspace, FaRedo} from 'react-icons/fa';
import {GiCancel} from 'react-icons/gi';
import {AiOutlineQuestionCircle} from 'react-icons/ai';
import {MdExitToApp} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import {ChallengeContext} from '../../ChallengeContext';
import axios from "axios";

import Layout from '../Layout';


import Instructions from './Instructions';
import Backdrop from '../wordle/Backdrop';
import Message from '../wordle/Message';
import ScoreCard from '../ScoreCard';


var currentGuess = [];
var currentScore = 0;
var word = setWord(); //setWord(); // use setWord wen hooked up to API
var guessPos = 0;
var lastClickedButton = [];

async function setWord(){

    

    let c;
    await axios.get('http://localhost:8084/anagram/api/v1/getword')
        .then(res => {
            c = res.data
            console.log(res.data)
        });

    var arr = c.split('');
    var n = arr.length;

    for(var i=0 ; i<n-1 ; ++i) {
        var j = Math.floor(Math.random() * n);

        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }


    word = arr.join('');


}


function Anagrams(){

    //const {currentChallenge, setCurrentChallenge} = useContext(ChallengeContext);

    const currentChallenge = localStorage.getItem('currentChallenge');

    const [instructions, setInstructions] = useState(true);
    const [playingGame, setPlayingGame] = useState(false);
    const [notWord, setNotWord] = useState(false);
    const [notEnoughLetters, setNotEnoughLetters] = useState(false);

    const [stopGame, setStopGame] = useState(false);

    const [timer, setTimer] = React.useState(0);

    let navigate = useNavigate();
    let times;

    let [fTime, setFTime] = useState(false);
    let [end, setEnd] = useState(false);
    

    useEffect( () => { 
        times = timer;
        setStopGame(false);
        const intervalId = setInterval( () => {
            updateRemainingTime();
        }, 1000);
        return () => clearInterval(intervalId);
    }, [playingGame])

    async function updateRemainingTime(){
        
        
        if(times === 0 && fTime){
                //setStopGame(true);
                setEnd(true);
                let data = {
    
                    username: localStorage.getItem("username"),
                    score: currentScore,
                    challengeId: currentChallenge
                }
                let returnV;
                await axios.post(`http://localhost:8081/challenge/api/v1/update`,data)
                    .then(res=>{
                        returnV = res.data;
                    })
                localStorage.removeItem('currentChallenge');
                if(returnV.winner === returnV.loser){
                    return;
                }else{ 
                    await axios.put(`http://localhost:8081/user/api/v1/update/Anagrams/${returnV.winner}/${returnV.loser}`);
                }
                
        }else{
            times--;
            setTimer(times);
            setFTime(true);
        }
    }

    function startGame(){
        
        setEnd(false);
        setStopGame(false);
        console.log(timer);
        setPlayingGame(true);
        setTimer(60);
        currentScore =0;
        
    }

    const [enterHan, setEnterHan] = useState(false);

    const handleKeyPress = useCallback( (event) => {
        //console.log(`key pressed: ${event.key}`);

        if(event.key === 'Backspace'){
            removeLetter();
        }else if(word.includes(event.key)){

            var id = 1;
            for(let i = -1; i > -6; i--){
                const box = document.getElementById(i);
                if(!lastClickedButton.includes(i) && word[ (i + 1) * -1] === event.key){
                    id = i;
                    break;
                }
            }
            if(id === 1){
                return;
            }
            letterClick(event.key, id);

        }else if(event.key === 'Enter' ){
            setEnterHan(true)
            enterWord();
        }
        
    }, []);

    useEffect( () => {

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        }
    }, [handleKeyPress])




    async function enterWord(){

        if(end){
            return;
        }
        setNotEnoughLetters(false);
        setNotWord(false);

        

        if(currentGuess.length < 5){

            setNotEnoughLetters(true);
            return;
        }

        let test
        let request = 'http://localhost:8084/anagram/api/v1/testword/' + currentGuess.join("")
        console.log('Request is returned as' + request)
        await axios.get('http://localhost:8084/anagram/api/v1/testword/' + currentGuess.join(""))
            .then(res => {
                test =  res.data
            })
        if(test === false){
            setNotWord(true);
            setEnterHan(false)
            return;
        }else{
            
            currentScore+=100;
            nextWord();
            setEnterHan(false)
        }
        
    }

    async function nextWord(){

        if(end){
            return;
        }

        await setWord();

        for(let i = 0; i < 5; i++){
            var temp = lastClickedButton[i];
            const box2 = document.getElementById(temp);
            box2.style.backgroundColor = '#d3d6da';

            const box = document.getElementById(i);
            box.textContent = '';
        }
        guessPos = 0;
        lastClickedButton = [];
        currentGuess = [];

        for(let i = 0; i < 5; i++){
            removeLetter();
        }
        
    }
    function letterClick(a, id){
        
        if(end){
            return;
        }

        setNotEnoughLetters(false);
        setNotWord(false);

        if(lastClickedButton.includes(id)){
            return;
        }
        currentGuess.push(a);
        const box = document.getElementById(guessPos);
        box.textContent = a;
        guessPos++;

        const box2 = document.getElementById(id);
        box2.style.backgroundColor = 'grey';
        lastClickedButton.push(id);


    }

    function removeLetter(){

        setNotEnoughLetters(false);
        setNotWord(false);

        if(guessPos === 0){
            return;
        }
        if (guessPos > 0){
            guessPos--;
        }

        let b = '';
        currentGuess.pop();
        const box = document.getElementById(guessPos);
        box.textContent = b;

        var last  = lastClickedButton[lastClickedButton.length -1];
        lastClickedButton.pop();
        const box2 = document.getElementById(last);
        box2.style.backgroundColor = '#d3d6da';

    }

    async function skipPressed(){

        
        if(!enterHan){
            await setWord();
            currentScore -=25;
            setNotWord(false);
            setNotEnoughLetters(false);
            //nextWord();
            guessPos = 0;
            lastClickedButton = [];
            currentGuess = [];
            for(let i = 0; i < 6; i++){
                if( i !== 0){
                    var temp = i * -1;
                    const box2 = document.getElementById(temp);
                    box2.style.backgroundColor = '#d3d6da';
                }
            
    
                const box = document.getElementById(i);
                box.textContent = '';
            }
            
            
        }
      
    }

    function quitMatch(){


        setPlayingGame(false);
        setNotWord(false);
        setNotEnoughLetters(false);
        setTimer(0);
        currentGuess = [];
        currentScore = 0;
        guessPos = 0;
        lastClickedButton = [];
        
    }

    function playAgain(){

        if(currentChallenge !== null){
            console.log(currentChallenge);
            //setCurrentChallenge(null);
        }
        setStopGame(false);

        quitMatch();

    }

    function quitGame(){

        if(currentChallenge !== null){
            console.log(currentChallenge);
            //setCurrentChallenge(null);
        }
        navigate('/');
    }

    var letterCombo = new Array(5).fill(null);

    const changeInstructions = () => setInstructions(!instructions);


    return(
        <div className='no-scroll'>

            <Layout Game={<h1 className="game-name">Anagrams <AiOutlineQuestionCircle className='help' onClick = {changeInstructions}/></h1>}/>

            {notEnoughLetters && <Message title='Not long enough.'/>}
            {notWord && <Message title = 'Not in word list.'/>}
            {instructions && <Instructions button={<GiCancel/>} handler={changeInstructions}/>}
            {instructions && <Backdrop onCancel={changeInstructions}/>}
            {playingGame && timer === 0 && <ScoreCard title='Game Over.' data={currentScore} score='Final Score: ' quitHandler ={quitGame} quitButton={<MdExitToApp/>} playHandler={playAgain} playButton={<FaRedo size = {20}/> }/>}

            <div className = 'quit-div'>
                {playingGame && <button className = 'stateB' onClick={quitMatch} id = 'quitButton' >Quit Round</button>}
            </div>

            <div className = 'start-anagrams'>
                {!playingGame && <button className = 'stateB' onClick={startGame} id = 'startButton'>Start</button>}
            </div>


            <div id ='anagram-option-container'>
                <div id = 'anagram-menu'>
                    {playingGame && <p className='timer'>{timer}</p>}
                    {playingGame && <p className='display-score'>Score: {currentScore}</p>}
                    {playingGame && <button className = 'stateC' id = 'skipButton' onClick={skipPressed}>Skip (-25)</button>}
                </div>

            </div>

            {playingGame && <div id='currentGuess-container'>
                <div id='currentGuess'>
                    {letterCombo.map(function(arr, comboIndex){
                        return <div class="letterSquare" id={comboIndex}></div>
                    })}


                </div>
            </div>}

            {playingGame && <div id="letterSet">
                <div className='letterSetRow'>


                    <button_Anagrams onClick= { () => letterClick(word[0], '-1') }id='-1'>{word[0]}</button_Anagrams>
                    <button_Anagrams onClick= { () => letterClick(word[1], '-2') }id='-2'>{word[1]}</button_Anagrams>
                    <button_Anagrams onClick= { () => letterClick(word[2], '-3') }id='-3'>{word[2]}</button_Anagrams>
                    <button_Anagrams onClick= { () => letterClick(word[3], '-4') }id='-4'>{word[3]}</button_Anagrams>
                    <button_Anagrams onClick= { () => letterClick(word[4], '-5') }id='-5'>{word[4]}</button_Anagrams>
                    <button_Anagrams onClick= { () => removeLetter() }id='-6'><FaBackspace size={20} /></button_Anagrams>
                    <button_Anagrams onClick= { () => enterWord() }id='-7' >↵</button_Anagrams>
                </div>

            </div>}



        </div>
    )
}

export default Anagrams;