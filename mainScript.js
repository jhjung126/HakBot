function response(room, msg, sender, isGroupChat, replier, imageDB) {
   /** @param {String} room - 방이름
    * @param {String} msg - 메세지 내용
    * @param {String} sender - 발신자 이름
    * @param {Boolean} isGroupChat - 단체채팅 여부
    * @param {Object} replier - 세션 캐싱 답장 메소드 객체
    * @param {Object} imageDB - 프로필 이미지와 수신된 이미지 캐싱 객체
    * @method imageDB.getImage() - 수신된 이미지가 있을 경우 Base64 인코딩 되어있는 JPEG 이미지 반환, 기본값 null
    * @method imageDB.getProfileImage() - Base64 인코딩 되어있는 JPEG 프로필 이미지 반환, 기본 값 null
    * @method replier.reply("String") - 메시지가 도착한 방에 답장을 보내는 메소드 */

   // Git 연동 테스트

   if(msg == "/도움"){
     replier.reply(help());
   } else if(msg.indexOf("/날씨 ") == 0){
     var arr = msg.split(" ");
     if(arr.length != 2){
       return;
     }
     var result = getWeatherInfo(arr[1]);
     if(result == null){
       replier.reply((arr[1]) + "의 날씨 정보를 가져올 수 없습니다.");
     } else {
       replier.reply(result);
     }


   } else if(msg.indexOf("/운세 ") == 0){
     var arr = msg.split(" ");
     if(arr.length != 2){
       return;
     }
     var result = getTodayLunkInfo(arr[1]);
     if(result == null){
       replier.reply((arr[1]) + "의 운세 정보를 가져올 수 없습니다.");
     } else {
       replier.reply(result);
     }
   } else if(msg.indexOf("/별자리 ") == 0){
     var arr = msg.split(" ")
     if(arr.length != 2){
       return;
     }
     var result = getTodayStarLunkInfo(arr[1]);
     if(result == null){
       replier.reply((arr[1]) + "의 별자리 정보를 가져올 수 없습니다.");
     } else {
       replier.reply(result);
     }
   }
}

function getWeatherInfo(pos){
   try{
     var data = Utils.getWebText("https://m.search.naver.com/search.naver?query=" + pos + "%20날씨");
     data = data.replace(/<[^>]+>/g,"");
     data = data.split("월간")[1];
     data = data.split("시간별 예보")[0];
     data = data.trim();
     data = data.split("\n");
     var results = [];
     if(data[0].indexOf("맑음") != -1){
       data[0] = data[0].replace("맑음","맑음 (해)").trim();
     } else if(data[0].indexOf("흐리고 비") != -1){
       data[0] = data[0].replace("흐리고 비","흐리고 비 (비)").trim();
     } else if(data[0].indexOf("구름많음") != -1){
       data[0] = data[0].replace("구름많음","구름많음 (구름)").trim();
     } else if(data[0].indexOf("눈") != -1){
       data[0] = data[0].replace("눈","눈 (눈)").trim();
     }
     results[0] = data[0];
     results[1] = data[3].replace("온도","온도 : ").trim() + "°C";
     results[2] = data[4].replace("온도","온도 : ").trim() + "°C";
     results[3] = data[9].replace("먼지","먼지 : ").trim();
     results[4] = data[13].replace("습도","습도 : ").trim() + "%";
     var result = "[" + pos + " 날씨 정보]\n\n상태 : " +results.join("\n");
     return result;
   } catch(e) {
     return null;
   }

}

function help(){
   var results = [];

   results[0] = "/날씨 [지역명]";
   results[1] = "/운세 {띠|연도(4자리)|연도(2자리)}"
   results[2] = "/별자리 {별자리|생일(4자리)}";

   var result = "[학봇 도움말]\n\n" +results.join("\n");
   return result;
}

var CALCZODIAC = new Array("원숭이","닭","개","돼지","쥐","소","호랑이","토끼","용","뱀","말","양");
var ZODIAC = new Array("쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지");

function getTodayLunkInfo(zodiac){
   try{
     var data = Utils.getWebText("https://m.search.naver.com/search.naver?query=띠별%20오늘의%20운세");
     data = data.replace(/<[^>]+>/g,"");
     data = data.split("별자리운세")[1];
     data = data.split("펼쳐보기")[0];
     data = data.trim();
     data = data.split("\n");

     if(!isNaN(zodiac)){
       if(zodiac.length == 2){
         zodiac = Number(zodiac) + 1900;
       }
       zodiac = CALCZODIAC[zodiac%12];
     }

     zodiac = zodiac.replace("띠","");

     for(var i = 0; i<data.length; i++){
       if(data[i].trim() == ""){
         data.splice(i,1);
         i--;
       }
     }

     var results = [];
     results[0] = data[ZODIAC.indexOf(zodiac) * 2 ].trim();
     results[1] = data[ZODIAC.indexOf(zodiac) * 2 + 1 ].trim();


     var result = "[오늘의 띠별 운세]\n\n" + results.join("\n");
     return result;
   } catch(e) {
     return null;
   }
}


var CONSTELLATION = new Array("물병","물고기","양", "황소", "쌍둥이", "게","사자","처녀","천칭","전갈","사수","염소");
var CALCCONSTELLATION =  new Array(120, 219,321,420,521,622,723,823,924,1023,1123,1225);

function getTodayStarLunkInfo(input){
   try{
     var data = Utils.getWebText("https://m.search.naver.com/search.naver?query=별자리운세");
     data = data.split('<div class="animal_star_area">')[1];
     data = data.replace(/<[^>]+>/g,"");
     data = data.split("펼쳐보기")[0];
     data = data.trim();
     data = data.split("\n");

     if(!isNaN(input)){
        input = Number(input);
       if(input.length == 6){
         input = input%10000;
       }
       for(var j=0; j<CALCCONSTELLATION.length; j++){
          if(j == 11){
             if(input >= CALCCONSTELLATION[11] || input < CALCCONSTELLATION[0]){
                input = CONSTELLATION[0];
                break;
             }
          }else {
             if(input >= CALCCONSTELLATION[j] && input < CALCCONSTELLATION[j+1]){
                input = CONSTELLATION[j];
                break;
             }
          }
       }
     }

     input = input.replace("자리","");

     for(var i = 0; i<data.length; i++){
       if(data[i].trim() == ""){
         data.splice(i,1);
         i--;
       }
     }

     var results = [];
     results[0] = data[CONSTELLATION.indexOf(input) * 2 ].trim();
     results[1] = data[CONSTELLATION.indexOf(input) * 2 + 1 ].trim();


     var result = "[오늘의 별자리 운세]\n\n" + results.join("\n");

     return result;
   } catch(e) {
     return null;
   }
}

var Map = function()
{
 this.map = new Object();
}

Map.prototype =
{
     put : function(key, value)
   {
         this.map[key] = value;
     },
     get : function(key)
   {
         return this.map[key];
     },
     containsKey : function(key)
   {
      return key in this.map;
     },
     containsValue : function(value)
   {
      for(var prop in this.map)
     {
       if(this.map[prop] == value) return true;
      }
      return false;
     },
     isEmpty : function(key)
   {
      return (this.size() == 0);
     },
     clear : function()
   {
      for(var prop in this.map)
     {
       delete this.map[prop];
      }
     },
     remove : function(key)
   {
      delete this.map[key];
     },
     keys : function()
   {
         var keys = new Array();
         for(var prop in this.map)
       {
              keys.push(prop);
         }
         return keys;
     },
     values : function()
   {
      var values = new Array();
         for(var prop in this.map)
       {
          values.push(this.map[prop]);
         }
         return values;
     },
     size : function()
   {
       var count = 0;
       for (var prop in this.map)
      {
         count++;
       }
       return count;
     },
   serialize : function()
   {
       var keyset = this.keys();
       var valset = this.values();
       var rValue = keyset[0] + "->" + valset[0];
       for(var i = 1; i < this.size(); i++)
       {
          rValue += "\n" + keyset[i] + "->" + valset[i];
       }
       return rValue;
   }
}
