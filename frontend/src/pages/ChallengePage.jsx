import React, {useState} from 'react';
import Layout from '../components/Layout';
import Message from '../components/wordle/Message';
import { useNavigate } from 'react-router-dom';
import './ChallengePage.scss';

var c = [ ["Wordle" , "Jacob", "--", 10], ["Wordle" , "Jacob", 5, "--"], ["Wordle" , "Jacob", 5, "--"]]

function ChallengePage(){
    
    let navigate = useNavigate();
    const [waiting, setWaiting] = useState(false);

    function clickChallenge(id){
        setWaiting(false);

        if(c[id][3] !== '--'){
            setWaiting(true);
            
        }else{

            if(c[id][0] === "Wordle"){
                navigate('/wordle');
            }else if(c[id][0] === "Anagrams"){
                navigate('/anagrams');
            }

        }
    }  

    return(
        <div>
            <Layout/>

            {waiting && <Message title='Waiting for opponent'/>}

            <div className='challenge-header'>
                <h1>Ongoing Challenges</h1>
            </div>
            <div className="challenge-container">

                <ul className='labels'>
                    <li><h3>Challenge</h3></li>
                    <li><h3>Opponent</h3></li>
                    <li><h3>Opp Score</h3></li>
                    <li><h3>Your Score</h3></li>
                </ul>
                <hr/>
                
                {c.map(function(c, index){
                    return <div onClick={() => clickChallenge(index)}>
                        <ul className='challenge' >
                            <li>{c[0]}</li>
                            <li>{c[1]}</li>
                            <li>{c[2]}</li>
                            <li>{c[3]}</li>
                        </ul>

                    </div>
                })}


            </div>


        </div>
    );


}

export default ChallengePage;