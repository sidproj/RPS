const express = require('express');
const jwt = require("jsonwebtoken");
const cookieParse = require('cookie-parser');
const bodyParser = require("body-parser");

const app = express();
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(cookieParse());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true,
}));
const port =    process.env.PORT || "3000";
const SECRET_KEY="lets play stone paper scissor bitches!!!!";

const createJWT=(score)=>{
    return jwt.sign({score},SECRET_KEY);
}

const decodeJWT=(token)=>{
    return jwt.verify(token,SECRET_KEY,(err,decodedToken)=>{
        return decodedToken['score'];
    });
}

app.listen(port,()=>{
    console.log(`listening on port ${port}`);
})

app.get("/",(req,res)=>{
    
    if(!req.cookies['score']){
        const scoreCookie = createJWT(0);
        res.cookie('score',scoreCookie);
        res.render("index",{score:0});
    }
    else{
        const scoreJWT=req.cookies['score'];
        const score = decodeJWT(scoreJWT);
        res.render("index",{score});
    }
});

app.get("/play/:hand",(req,res)=>{
    const testHand=req.params.hand.toLocaleUpperCase;
    if(testHand == "ROCK" || testHand == "PAPER" || testHand == "SCISSOR"){
        const hands=["STONE","PAPER","SCISSOR"];
        const house= hands[Math.floor(Math.random()*3)];
        const user = req.params.hand.toUpperCase();

        let score = decodeJWT(req.cookies['score']);

        const state=findResult(user,house);
        if(state==1){
            score++;
        }

        //const scoreJWT = createJWT(score);

        res.cookie("score",createJWT(score));
        res.render('result',{user,house,state,score:score});
    }
    else{
        res.redirect("/");
    }
});

app.get("/resetscore",(req,res)=>{
    res.cookie("score",createJWT(0));
    res.redirect("/");
});

const findResult=(user,house)=>{
    let state=0;
    if( user=="STONE" && house=="SCISSOR" ){
        state=1;
    }
    else if(user=="STONE" && house=="PAPER" ){
        state=-1;
    }
    else if(user=="SCISSOR" && house=="PAPER"){
        state=1;
    }
    else if(user=="SCISSOR" && house=="STONE"){
        state=-1;
    }
    else if(user=="PAPER" && house=="STONE"){
        state=1;
    }
    else if(user=="PAPER" && house=="SCISSOR"){
        state=-1;
    }
    return state;
}