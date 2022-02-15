package com.txthub.usersystem.user;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static java.lang.Math.pow;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public Boolean createUser(String username, String password){
        List<User> user = userRepository.findByUsername(username);
        if(user.isEmpty()){
            System.out.println("user not found, creating a user");
            User newUser = new User(username, password);
            userRepository.save(newUser);
            return true;
        }
        System.out.println("user found");

        return false;

    }

    public User login(String username, String password){
        List<User> userList = userRepository.findByUsernameAndPassword(username,password);
        if(!userList.isEmpty()) {
            return userList.get(0);
        }
        return null;
    }

    public User changePassword(String id, String newPassword){
        Optional<User> user = userRepository.findById(id);
        if(user.isPresent()){
            user.get().setPassword(newPassword);
            userRepository.save(user.get());
            return user.get();
        }
        return null;
    }

    public User changeUsername(String id, String newUsername){
        Optional<User> user = userRepository.findById(id);
        if(user.isPresent()){
            user.get().setUsername(newUsername);
            userRepository.save(user.get());
            return user.get();
        }
        return null;
    }

    public boolean deleteAccount(String id){
        try {
            userRepository.deleteById(id);
        }catch (IllegalArgumentException e){
            return false;
        }
        return true;
    }

    public boolean updateRating(String game, String winnerId, String loserId){
        Optional<User> winner = userRepository.findById(winnerId);
        Optional<User> loser = userRepository.findById(loserId);
        if(winner.isEmpty() || loser.isEmpty()){
            return false;
        }


        switch (game){
            case "anagram":
                changeAnagramRating(winner.get(), loser.get());
                return true;
            case "wordle":
                changeWordleRating(winner.get(), loser.get());
                return true;
            case "tba":
                changeTbaRating(winner.get(), loser.get());
            default:
                return false;
        }
    }

    public void changeAnagramRating(User winner, User loser){

        double change = calculateChange(winner.getAnagramRating(), loser.getAnagramRating());
        winner.setAnagramRating(winner.getAnagramRating() + change);
        userRepository.save(winner);
        loser.setAnagramRating(loser.getAnagramRating() - change);
        userRepository.save(loser);
    }

    public void changeWordleRating(User winner, User loser){
        double change = calculateChange(winner.getWordleRating(), loser.getWordleRating());
        winner.setWordleRating(winner.getWordleRating() + change);
        userRepository.save(winner);
        loser.setWordleRating(loser.getWordleRating() - change);
        userRepository.save(loser);
    }

    public void changeTbaRating(User winner, User loser){
        double change = calculateChange(winner.getTbaRating(), loser.getTbaRating());
        winner.setTbaRating(winner.getTbaRating() + change);
        userRepository.save(winner);
        loser.setTbaRating(loser.getTbaRating() - change);
        userRepository.save(loser);
    }

    public double calculateChange(double winnerRating, double loserRating){
        double difference = loserRating - winnerRating;
        double predictedOutcome = 1 / (1 + pow(10, (difference) / 400));
        return 32 * (1 - predictedOutcome);

    }




}
