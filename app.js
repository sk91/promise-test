var express=require("express");

var app=express();



app.use(express.static(__dirname+'/public_html'));
app.use(express.bodyParser());

app.get('/is_online/:id',function(req,res){
	var id=req.params.id;
	if(Math.random()>0.5  && id>=0){
		res.send({online:1});
	}else{
		res.send({online:0});
	}
});

app.post('/results',function(req,res){

	var results=typeof req.body.results !=="undefined";
	if(results){
		res.send({complete:1});
	}else{
		res.send({complete:0});
	}
});

app.listen(3000, function(){
	console.log("Server is listening on port 3000");
});
