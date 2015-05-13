var promise_test;

(function($,document){
	var users=100,
		masterUrl="http://localhost:3000/";

	var p=promise_test={

		initialized:false,
		started:false,
		completed:false,

		init:function(users,masterUrl){
			p.total_users=users;
			p.masterUrl=masterUrl;
			p.reset();
			$(document).ready(p.ready);
		},

		reset:function(){
			p.users_status=new Array(p.total_users);
			p.users_online=0;
		},

		ready:function(){
			p.element_rprogress=$("#users-progress");
			p.element_rprogress.attr('max',p.total_users-1);
			p.element_oprogress=$("#online-users-progress");
			p.element_rprogress.attr('max',p.total_users-1);
			p.element_ocount=$("#online-users");
			p.element_status=$("#status");
			p.element_start=$("#start");
			p.bindEvents();
			p.initialized=true;
		},

		bindEvents:function(){
			p.element_start.click(p.start);
		},

		start:function(){
			if(p.initialized){
				if(!p.started){
					if(p.completed){
						p.reset();
					}
					p.initPage();
					p.element_start.attr('disabled',true);
					p.started=true;
					p.startRequestChain().done(p.complete);
					p.status("Started...");
				}
			}
		},

		startRequestChain:function(){
			var requestChain=$.Deferred();

			var lastInChain=false;
			for(var i=0;i<p.total_users;i++){
				lastInChain=p.sendUserStatusRequest(lastInChain,i);
			}
			lastInChain.done(function(){
				p.completeRequestChain();
				requestChain.resolve();
			});


			return requestChain;
		},

		sendUserStatusRequest:function(lastInChain,id){
			var d=$.Deferred();

			function success(data){
				p.progressRequests(id);
				p.users_status[id]=data.online;
				if(data.online==1){
					p.updateOnlineUsers(++p.users_online);
				}
				d.resolve();
			}


			function ajaxRequest(id){
				var url=p.masterUrl+"is_online/"+id;
				p.status("Requesting user " + id +" status...");
				$.ajax({
					url:url,
					dataType:'json',
					success:success
				});


			}
			if(lastInChain!==false){
				lastInChain.done(function(){
					ajaxRequest(id);
				});
			}else{
				ajaxRequest(id);
			}
			return d;
		},

		sendResultsToServer:function(){
			var url=p.masterUrl+"results",
				data={
					results:{
						usesrs_statuses:p.users_status,
						users_online:p.users_online,
						total_user:p.total_users
					}
				};

			function success(data){
				if(data.complete==1){
					p.status("Result submitted successfully");
				}else{
					p.status("Result not rescived by the server");
				}
			}

			$.ajax({
					url:url,
					type:"POST",
					data:data,
					dataType:"json",
					success:success

				}
			);
		},

		completeRequestChain:function(){
			p.status("User requests complete,sending results to server");
			p.sendResultsToServer();
		},

		complete:function(){
			if(p.started){
				p.element_start.attr('disabled',false);
				p.started=false;
				p.completed=true;
			}
		},


		initPage:function(){
			p.status("Initializing...");
			p.progressRequests(0);
			p.progressOnline(p.users_online);
		},

		status:function(message){
			p.element_status.html(message);
		},

		progressRequests:function(requests){
			p.element_rprogress.val(requests);
		},

		progressOnline:function(online){
			p.element_oprogress.val(online);
		},

		usersOnlineCount:function(online){
			p.element_ocount.html(online+"/"+p.total_users);
		},

		updateOnlineUsers:function(online){
			p.progressOnline(online);
			p.usersOnlineCount(online);
		}
	}
	p.init(users,masterUrl);
})(jQuery,document);
