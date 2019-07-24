(function () {
    function listCtrl($scope, $http){
        $scope.showClubCard=false;
        if (!$scope.$$phase) $scope.$apply();
        var map = new AMap.Map('container',{
            resizeEnable: true,
            mapStyle: 'amap://styles/whitesmoke',
            zoom:14
        });
        //获取当前位置信息
        AMap.plugin('AMap.Geolocation', function() {
            var geolocation = new AMap.Geolocation({
                enableHighAccuracy: true,//是否使用高精度定位，默认:true
                timeout: 10000 ,         //超过10秒后停止定位，默认：5s
                zoomToAccuracy: false
            });
            map.addControl(geolocation);
            geolocation.getCurrentPosition(function(status,result){
                if(status=='complete'){
                    $scope.position=result.position;
                    map.setZoomAndCenter(14, [$scope.position.lng, $scope.position.lat]);
                    //监听定位按钮
                    AMap.event.addDomListener(document.getElementById('positionIcon'), 'click', function() {
                        map.setZoomAndCenter(16, [$scope.position.lng, $scope.position.lat]);
                        addMarker($scope.position.lng, $scope.position.lat);
                        $scope.showClubCard=false;
                        if (!$scope.$$phase) $scope.$apply();
                    });
                }else{
                    alert('定位失败！')
                }
            });
        });
        //给标签设置文本
        function addMarker(num1,num2) {
            var icon = new AMap.Icon({
                image: "https://bocai-center.oss-cn-hangzhou.aliyuncs.com/center_manager/static_img/personal.png",
                size: new AMap.Size(28, 30)
            });
            marker = new AMap.Marker({
                icon:icon ,
                position: [num1, num2],
                offset: new AMap.Pixel(-14, -30)
            });
            marker.setMap(map);
            marker.setLabel({
                offset: new AMap.Pixel(-40, -30),  //设置文本标注偏移量
                content: "<div class='info'>当前位置</div>", //设置文本标注内容
                direction: 'right' //设置文本标注方位
            });
        }
        //添加点标记群组
        function mapInitialization (arr) {
            map.clearMap();
            var markers = []; //province见Demo引用的JS文件
             //arr为需要标点的数据
            for (var i = 0; i < arr.length; i += 1) {
                var marker;
                var img;
                if (arr[i].clubType === 1) {
                    img='https://bocai-center.oss-cn-hangzhou.aliyuncs.com/center_manager/static_img/icon1.png';
                }  else if (arr[i].clubType === 2) {
                    img='https://bocai-center.oss-cn-hangzhou.aliyuncs.com/center_manager/static_img/icon4.png';
                }else if (arr[i].clubType === 3) {
                    img='https://bocai-center.oss-cn-hangzhou.aliyuncs.com/center_manager/static_img/icon3.png';
                }else if (arr[i].clubType === 4) {
                    img='https://bocai-center.oss-cn-hangzhou.aliyuncs.com/center_manager/static_img/icon2.png';
                }else if (arr[i].clubType === 5) {
                    img='https://bocai-center.oss-cn-hangzhou.aliyuncs.com/center_manager/static_img/icon5.png';
                }else if (arr[i].clubType === 6) {
                    img='https://bocai-center.oss-cn-hangzhou.aliyuncs.com/center_manager/static_img/icon6.png';
                }
                var icon = new AMap.Icon({
                    image: img,
                    size: new AMap.Size(28, 42)
                });
                marker = new AMap.Marker({
                    icon: icon,
                    position: [arr[i].longitude,arr[i].latitude],
                    offset: new AMap.Pixel(-14,-42),
                    zIndex: 101,
                    title: arr[i].name,
                    map: map,
                    extData:arr[i].id
                });
                markers.push(marker);
                marker.on('click', clickHandler);
            }
            //显示所有的场馆
            // map.setFitView();
            var hideCard=function () {
                $scope.showClubCard=false;
                if (!$scope.$$phase) $scope.$apply();
            }
            // 绑定事件
            map.on('click', hideCard);
        }
        $scope.conditions={
            clubMessage:''
        }
        $scope.clubType=-1;
        function clickHandler(e) {
            var id=e.target.getExtData();
            for(var i=0,len=clubs.length;i<len;i++){
                 if(id==clubs[i].id){
                     $scope.conditions.clubMessage=clubs[i];
                     if (!$scope.$$phase) $scope.$apply();
                 }
            }
            setTimeout(function () {
                $scope.showClubCard=true;
                if (!$scope.$$phase) $scope.$apply();
            },50)
        };
        mapInitialization(clubs);
         $scope.navList=[
            {name:'全部',id:0,selected:true},
            {name:'健身',id:1,selected:false},
            {name:'场馆',id:2,selected:false},
            {name:'篮球',id:3,selected:false},
            {name:'游泳',id:4,selected:false},
            {name:'羽毛球',id:5,selected:false},
            {name:'瑜伽',id:6,selected:false}
        ];
         var list=angular.copy(clubs);
         $scope.selectNav=function (id) {
             $scope.clubType=id;
             $scope.keyword='';
             map.setZoom(14);
             addMarker($scope.position.lng, $scope.position.lat);
             if (!$scope.$$phase) $scope.$apply();
             for(var i=0,len=$scope.navList.length;i<len;i++){
                 if(id==$scope.navList[i].id){
                     $scope.navList[i].selected=true;
                 }else{
                     $scope.navList[i].selected=false;
                 }

             };
             var arr=[];
             if(id==0){
                 arr=clubs;
             }else{
                 for(var i=0,len=list.length;i<len;i++){
                     if(id==list[i].clubType){
                         arr.push(list[i])
                     }
                 };
             }
             mapInitialization(arr);
         };
         $scope.toDetail=function () {
                 window.location.href = 'web/h5/88fit/' + $scope.conditions.clubMessage.id;
         };
         $scope.searchEvent=function () {
             var data={
                 clubType:$scope.clubType==0?-1:$scope.clubType,
                 keyword:$scope.keyword
             }
             if($scope.keyword==undefined){
                 return ;
             }else{
                 $http.post('../api/fit88/search',data).then(function (resp) {
                     if(resp.data.data.length!=0){
                         mapInitialization(resp.data.data);
                     }else{
                        return alert('没有相关场馆')
                     }
                 },function (err) {

                 })
             }


         }
    }
    function detailCtrl($scope, $http){
          $scope.clubDetail=club;
          $scope.showLeft=false;
          $scope.showRight=true;
            //获取本周日期
         $scope.getWeek=function(i,needDate) {
                var now = needDate?needDate:new Date();
                var firstDay=new Date(now);
                firstDay.setDate(firstDay.getDate() + i);
                mon = (Number(firstDay.getMonth()) + 1)<10?'0'+(Number(firstDay.getMonth()) + 1):Number(firstDay.getMonth()) + 1;
                day=firstDay.getDate()<10?'0'+firstDay.getDate():firstDay.getDate();
                return mon + "." + day+'_'+firstDay;
            };
         $scope.getDayStr = function(i,needDate){
                var now = needDate?new Date(needDate):new Date();
                var day=new Date(now.getTime() + i * 86400000);
                var str = "";
                if(day.getFullYear()==new Date().getFullYear()&&day.getMonth()==new Date().getMonth()&&day.getDate()==new Date().getDate()){
                    return "今天";
                }
                if(day.getDay()==1){
                    str="一"
                }else if(day.getDay()==2){
                    str="二"
                }else if(day.getDay()==3){
                    str="三"
                }else if(day.getDay()==4){
                    str="四"
                }else if(day.getDay()==5){
                    str="五"
                }else if(day.getDay()==6){
                    str="六"
                }else if(day.getDay()==0){
                    str="日"
                }
                return str;
            };
         $scope.weekLists=[
                {'weekDate':$scope.getWeek(0).split('_')[0],'id':0,'status':true,'weekTxt':'今天','date':$scope.getWeek(0).split('_')[1]},
                {'weekDate':$scope.getWeek(1).split('_')[0],'id':0,'status':false,'weekTxt':$scope.getDayStr(1),'date':$scope.getWeek(1).split('_')[1]},
                {'weekDate':$scope.getWeek(2).split('_')[0],'id':0,'status':false,'weekTxt':$scope.getDayStr(2),'date':$scope.getWeek(2).split('_')[1]},
                {'weekDate':$scope.getWeek(3).split('_')[0],'id':0,'status':false,'weekTxt':$scope.getDayStr(3),'date':$scope.getWeek(3).split('_')[1]},
                {'weekDate':$scope.getWeek(4).split('_')[0],'id':0,'status':false,'weekTxt':$scope.getDayStr(4),'date':$scope.getWeek(4).split('_')[1]}
            ];
         $scope.selectWeekDate=function (data) {
                for(var i=0,len=$scope.weekLists.length;i<len;i++){
                    if(data==$scope.weekLists[i].weekDate){
                        $scope.weekLists[i].status=true;
                    }else{
                        $scope.weekLists[i].status=false;
                    }
                }
            };
         $scope.addDate=function () {
                var d=new Date($scope.weekLists[4].date);
                d.setDate(d.getDate()+1);
                $scope.weekLists=[
                    {'weekDate':$scope.getWeek(0,d).split('_')[0],'id':0,'status':true,'weekTxt':$scope.getDayStr(0,d),'date':$scope.getWeek(0,d).split('_')[1]},
                    {'weekDate':$scope.getWeek(1,d).split('_')[0],'id':0,'status':false,'weekTxt':$scope.getDayStr(1,d),'date':$scope.getWeek(1,d).split('_')[1]},
                    {'weekDate':$scope.getWeek(2,d).split('_')[0],'id':0,'status':false,'weekTxt':$scope.getDayStr(2,d),'date':$scope.getWeek(2,d).split('_')[1]},
                    {'weekDate':$scope.getWeek(3,d).split('_')[0],'id':0,'status':false,'weekTxt':$scope.getDayStr(3,d),'date':$scope.getWeek(3,d).split('_')[1]},
                    {'weekDate':$scope.getWeek(4,d).split('_')[0],'id':0,'status':false,'weekTxt':$scope.getDayStr(4,d),'date':$scope.getWeek(4,d).split('_')[1]}
                ];
                $scope.showLeft=true;
            };
         $scope.subDate=function () {
                var d=new Date($scope.weekLists[0].date);
                if(d.getTime()<=new Date().getTime()){
                    console.log('已经在今天')
                    $scope.showLeft=false;
                }else{
                    d.setDate(d.getDate()-5);
                    $scope.weekLists=[
                        {'weekDate':$scope.getWeek(0,d).split('_')[0],'id':0,'status':true,'weekTxt':$scope.getDayStr(0,d),'date':$scope.getWeek(0,d).split('_')[1]},
                        {'weekDate':$scope.getWeek(1,d).split('_')[0],'id':0,'status':false,'weekTxt':$scope.getDayStr(1,d),'date':$scope.getWeek(1,d).split('_')[1]},
                        {'weekDate':$scope.getWeek(2,d).split('_')[0],'id':0,'status':false,'weekTxt':$scope.getDayStr(2,d),'date':$scope.getWeek(2,d).split('_')[1]},
                        {'weekDate':$scope.getWeek(3,d).split('_')[0],'id':0,'status':false,'weekTxt':$scope.getDayStr(3,d),'date':$scope.getWeek(3,d).split('_')[1]},
                        {'weekDate':$scope.getWeek(4,d).split('_')[0],'id':0,'status':false,'weekTxt':$scope.getDayStr(4,d),'date':$scope.getWeek(4,d).split('_')[1]}
                    ];
                    if($scope.weekLists[0].weekTxt=='今天'){
                        $scope.showLeft=false;
                    }
                }

            };
        var map = new AMap.Map('maps', {
            resizeEnable: true
        });
        function addMarker() {
            var icon = new AMap.Icon({
                image: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
                size: new AMap.Size(20, 30)
            });
            marker = new AMap.Marker({
                icon:icon ,
                position: [club.longitude, club.latitude],
                offset: new AMap.Pixel(-10, -30)
            });
            marker.setMap(map);
        }
        map.setZoomAndCenter(20, [club.longitude, club.latitude]);
        addMarker();
        $scope.rerurnIndex=function () {
            window.location.href='web/h5/88fit';
        };
    }
    angular.module('fit88', [])
        .controller('listCtrl',['$scope','$http', listCtrl])
        .controller('detailCtrl', ['$scope','$http', detailCtrl]);
})();