var bonds = 100;
var lapse_hour = 4;
var lapse_minute = 0;
var shiji = 15;
var gameover = false;
var sansei = 0;
var hantai = 0;
var timeover = false;

function speak(message, pos=0, func) // whoは0なら単純メッセージ、1なら主流派、2なら造反組
{
	if(pos == message.length)
	{
		if(func != null)
		{
			setTimeout(func, 750);
		}
		return;
	}
//	$( '#sound-speak' ).get(0).play() ;
	wait_time = 50;
	if(message.substr)
	{
		if(message.substr(pos,1) == "。")
		{
			wait_time += 200;
		}
		if(message.substr(pos,1) == "、")
		{
			wait_time += 100;
		}
		if(message.substr(pos,1) == "！")
		{
			wait_time += 200;
		}
		if(message.substr(pos,1) == "!")
		{
			wait_time += 200;
		}
	}
	pos++;
	if(message.substr)
	{
		cur = message.substr(0,pos);
		$("#message").html(cur);
	}
	setTimeout(speak, wait_time, message, pos, func);
}

function action(type)
{
	$.ajax({
		type: "GET",
		url: "action.php",
		data: "type=" + type,
		success: function(text){
			if(text == "") return;
			var obj = JSON.parse(text);
			mes_index = 0;
			DisableButton();
			ProcessMessages(obj.messages);
		}
	});
}

window.onresize = WindowResize;

function WindowResize()
{
	if(window.innerWidth >= 480)
	{
		$("#progressbar_front").css({ width: (bonds*320/100)+'px'});
		$("#shijiritsu_front").css({ width: (shiji*320/15)+'px'});
	}
	else
	{
		$("#progressbar_front").css({ width: (bonds*250/100)+'px'});
		$("#shijiritsu_front").css({ width: (shiji*250/15)+'px'});
	}
}

function ChangeBondsBar(val,func = null)
{
	if(window.innerWidth >= 680)
	{
		$("#progressbar_front").animate({ width: (val*320/100)+'px'} , 1000, "linear" , func);
	}
	else
	{
		$("#progressbar_front").animate({ width: (val*250/100)+'px'} , 1000, "linear" , func);
	}
}

function ChangeShijiBar(val,func = null)
{
	if(window.innerWidth >= 680)
	{
		$("#shijiritsu_front").animate({ width: (val*320/15)+'px'} , 1000, "linear" , func);
	}
	else
	{
		$("#shijiritsu_front").animate({ width: (val*250/15)+'px'} , 1000, "linear" , func);
	}
}

var mes_index = 0;
var saved_messages;
function ProcessMessages(messages = saved_messages)
{
	saved_messages = messages;
	if(mes_index < 0)
	{
		return;
	}
	if(mes_index >= messages.length)
	{
		EnableButton();
		return;
	}
	mes = messages[mes_index];
	mes_index++;
	if(mes["message"])
	{
		if(mes["side"] == "shu")
		{
			$("#message").addClass("balloon_up");
			$("#message").removeClass("balloon_down");
			$("#message").removeClass("balloon");
			$("#message").css("color","black")
			speak(mes["message"],0, ProcessMessages);
		}
		if(mes["side"] == "shitsugen")
		{
			$("#message").addClass("balloon_up");
			$("#message").removeClass("balloon_down");
			$("#message").removeClass("balloon");
			$("#message").css("color","red")
			speak(mes["message"],0, ProcessMessages);
		}
		if(mes["side"] == "han")
		{
			$("#message").removeClass("balloon_up");
			$("#message").addClass("balloon_down");
			$("#message").removeClass("balloon");
			speak(mes["message"],0, ProcessMessages);
		}
		if(mes["side"] == "oth")
		{
			$("#message").removeClass("balloon_up");
			$("#message").removeClass("balloon_down");
			$("#message").addClass("balloon");
			speak(mes["message"],0, ProcessMessages);
		}
	}
	if(mes["image"])
	{
		id = "#"+mes.side+"_img";
		src = mes.image;
		$(id).attr("src", "./images/" + src);
		setTimeout(ProcessMessages, 0);
	}
	if(mes["bonds"])
	{
		bonds += mes["bonds"];
		if(bonds > 100) bonds = 100;	
		if(bonds < 0)
		{
			bonds = 0;
			$("#bonds_percent").text("結束 " + bonds.toFixed() + "%");
			ChangeBondsBar(0,null);
			action("kesseki");
			return;
		}
		ChangeBondsBar(bonds,ProcessMessages);
		$("#bonds_percent").text("結束 " + bonds.toFixed() + "%");
	}
	if(mes["shiji"])
	{
		shiji += mes["shiji"];
		if(shiji > 15) shiji = 15;	
		if(shiji <= 0)
		{
			shiji = 0;
			$("#shiji").text("内閣支持率 "+shiji.toFixed(1)+"%");
			ChangeShijiBar(shiji, null);
			action("shijizero");
			return;
		}
		$("#shiji").text("内閣支持率 "+shiji.toFixed(1)+"%");
		ChangeShijiBar(shiji, ProcessMessages);
	}
	if(mes["gameover"])
	{
		gameover = true;
		result = mes["gameover"];
		result2 = "";
		if(result == "win")
		{
			title = "内閣不信任案　投票結果";
			result_str = "賛成:"+sansei+" 反対:"+hantai + "。よって、不信任案は" + ((sansei > hantai) ? "可決" : "否決") + "されました";
			result2 = "<div style='color:red;font-size:x-large;text-align:center;'>YOU WIN</div>"
		}
		if(result == "lose")
		{
			title = "内閣不信任案　投票結果";
			result_str = "賛成:"+sansei+" 反対:"+hantai + "。よって、不信任案は" + ((sansei > hantai) ? "可決" : "否決") + "されました";
			result2 = "<div style='color:blue;font-size:x-large;text-align:center;'>YOU LOSE</div>"
		}
		if(result == "shiji0")
		{
			title = "首相は早期退陣させられました";
			result_str = "内閣支持率がなくなりました";
			result2 = "<div style='color:blue;font-size:x-large;text-align:center;'>YOU LOSE</div>"
		}
		if(result == "kesseki")
		{
			title = "造反者の結束は崩れさりました";
			result_str = "造反者たちは欠席しました";
			result2 = "<div style='color:red;font-size:x-large;text-align:center;'>YOU WIN</div>"
		}
		tweet_button = "<a href='https://twitter.com/intent/tweet?button_hashtag=Nagata2000&ref_src=twsrc%5Etfw' class='twitter-hashtag-button' data-size='large' data-text='#永田町バトル2000 "+result_str+"' data-url='http://www.nagata2000.jp/' data-show-count='false'>Tweet #Nagata2000</a><script async src='https://platform.twitter.com/widgets.js' charset='utf-8'></script>";
		$("#dialog_result").html(result_str + result2 + tweet_button);
		$("#dialog").dialog({
			modal:true, //モーダル表示
			title:title,
			buttons: { //ボタン
				"不信任案をもう一度提出する": function() {
					location.reload();
				},
				"内閣総辞職": function() {
					location="./index.html";
				}
			}
		});
		setTimeout(ProcessMessages, 0);
	}
	if(mes["sansei"] != undefined)
	{
		sansei = mes["sansei"];
		setTimeout(ProcessMessages, 0);
	}
	if(mes["hantai"] != undefined)
	{
		hantai = mes["hantai"];
		setTimeout(ProcessMessages, 0);
	}
}

function DisableButton()
{
	$("#ButtonTel").addClass("disabled");
	$("#ButtonMitsu").addClass("disabled");
	$("#ButtonDoukatsu").addClass("disabled");
	$("#ButtonKouenkai").addClass("disabled");
	$("#ButtonGenkin").addClass("disabled");
	$("#ButtonMassCom").addClass("disabled");
	$("#ButtonJomei").addClass("disabled");
	$("#ButtonPost").addClass("disabled");
}

function EnableButton()
{
	if(gameover == false)
	{
		$("#ButtonTel").removeClass("disabled");
		$("#ButtonMitsu").removeClass("disabled");
		$("#ButtonDoukatsu").removeClass("disabled");
		$("#ButtonKouenkai").removeClass("disabled");
		$("#ButtonGenkin").removeClass("disabled");
		$("#ButtonMassCom").removeClass("disabled");
		$("#ButtonJomei").removeClass("disabled");
		$("#ButtonPost").removeClass("disabled");
	}
}

$(function(){
	bonds = 100;
	shiji = 15;
	ChangeShijiBar(shiji,null);
	$("#shiji").text("内閣支持率 "+shiji.toFixed()+"%");
	ChangeBondsBar(bonds,null);
	action("start");
	setTimeout(TimerHandler, 1000);
});

function TimerHandler()
{
	if(lapse_minute > 0) lapse_minute--;
	else{
		lapse_minute = 59;
		if(lapse_hour) lapse_hour--;
		else
		{
			timeover = true;
			lapse_minute = 0;
			lapse_hour = 0;
			$("#nokori").text("残り 0時間0分");
			setTimeout(action,1000,"saiketsu");
			return;
		}
	}
	$("#nokori").text("残り " + lapse_hour + "時間" + lapse_minute+ "分");
	if(gameover == false) setTimeout(TimerHandler, 1000);
}
