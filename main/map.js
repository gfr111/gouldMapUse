(function () {
    function listCtrl($scope, $http){
        $scope.showClubCard=false;
        $scope.showSearch=false;
        $scope.keyword='';
        $scope.isLoading=false;
        var walking;
        if (!$scope.$$phase) $scope.$apply();

        // 获取输入提示信息
        $scope.autoInput=function(){
            if($scope.keyword==''){
                $scope.showSearch=false;
                $scope.searchResultList=[];
            }else{
                $scope.searchResultList=[];
                AMap.plugin('AMap.Autocomplete', function(){
                    // 实例化Autocomplete
                    var autoOptions = {
                        city: 'hangzhou'
                    }
                    var autoComplete = new AMap.Autocomplete(autoOptions);
                    autoComplete.search($scope.keyword, function(status, result) {
                        if(result.info=='OK'){
                            $scope.showSearch=true;
                            var list=result.tips;
                            for(var i=0,len=list.length;i<len;i++){
                                if(list[i].location!=undefined&&list[i].location!=''&&list[i].location!=null){
                                    $scope.searchResultList.push(list[i]);
                                }
                            }
                            if (!$scope.$$phase) $scope.$apply();
                        }
                    })
                })
            }
        }
        $scope.autoInput();
        //获取当前位置信息
        var map = new AMap.Map('container',{
            resizeEnable: true,
            mapStyle: 'amap://styles/whitesmoke',
            zoom:14,
            fitView: true
        });
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
                    $scope.startAdress=result.formattedAddress;
                    map.setZoomAndCenter(14, [$scope.position.lng, $scope.position.lat]);
                    //监听定位按钮
                    AMap.event.addDomListener(document.getElementById('positionIcon'), 'click', function() {
                        map.setZoomAndCenter(14, [$scope.position.lng, $scope.position.lat]);
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
            if(walking){
                walking.clear();
            }
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
                    img='https://bocai-center.oss-cn-hangzhou.aliyuncs.com/center_manager/static_img/icon9.png';
                }else if (arr[i].clubType === 6) {
                    img='https://bocai-center.oss-cn-hangzhou.aliyuncs.com/center_manager/static_img/icon7.png';
                }else if (arr[i].clubType === 7) {
                    img='https://bocai-center.oss-cn-hangzhou.aliyuncs.com/center_manager/static_img/icon8.png';
                }else if (arr[i].clubType === 8) {
                    img='https://bocai-center.oss-cn-hangzhou.aliyuncs.com/center_manager/static_img/icon10.png';
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
            var hideCard=function () {
                $scope.showClubCard=false;
                if(walking){
                    walking.clear();
                }
                if (!$scope.$$phase) $scope.$apply();
            }
            // 绑定事件
            map.on('click', hideCard);
        }
        $scope.hideClub=function () {
            $scope.showClubCard=false;
            if(walking){
                walking.clear();
            }
            if (!$scope.$$phase) $scope.$apply();
        };
        $scope.conditions={
            clubMessage:''
        }
        $scope.clubType=-1;
        function clickHandler(e) {
            var id=null;
            if(e.target==undefined){
                id=e;
            }else{
                id=e.target.getExtData();
            }
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
            {name:'健身房',id:1,selected:false},
            {name:'综合馆',id:2,selected:false},
            {name:'篮球场',id:3,selected:false},
            {name:'游泳馆',id:4,selected:false},
            {name:'体适能',id:5,selected:false},
            {name:'足球场',id:6,selected:false},
            {name:'皮划艇',id:7,selected:false},
             {name:'滑步车',id:8,selected:false}
        ];
         var list=angular.copy(clubs);
         $scope.selectNav=function (id) {
             $scope.clubType=id;
             $scope.keyword='';
             map.getAllOverlays('marker');
             map.setZoom(14);
             if(walking){
                 walking.clear();
             }
             $scope.showClubCard=false;
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
             if(isContainer(arr).length==0){
                 map.setZoom(12);
                 if(isContainer(arr).length==0){
                     map.setZoom(10);
                     if(isContainer(arr).length==0){
                         map.setZoom(8);
                     }
                 }
             }
             mapInitialization(arr);
         };
         //判断视野范围内是否有标记点
         function isContainer(arr) {
             var bound=map.getBounds();//地图可视区域
             var containerList=[];
             for(var i=0,len=arr.length;i<len;i++){
                 var  point = [arr[i].longitude,arr[i].latitude]
                 if(bound.contains(point)){
                     containerList.push(arr[i])
                 }
             }
             return containerList;
         }
         $scope.toDetail=function () {
                 window.location.href = 'web/h5/88fit/' + $scope.conditions.clubMessage.id;
         };
         $scope.searchEvent=function () {
             var data={
                 clubType:$scope.clubType==0?-1:$scope.clubType,
                 keyword:$scope.keyword
             }
             if($scope.keyword==undefined||$scope.keyword==''){
                return alert('请输入关键字！')
             }else{
                 $http.post('../api/fit88/search',data).then(function (resp) {
                     if(resp.data.data.length!=0){
                         $scope.showSearch=true;
                         $scope.searchResultList=resp.data.data;
                     }else{
                        return alert('没有相关场馆')
                     }
                 },function (err) {

                 })
             }
         };
         $scope.chooseSearch=function (item) {
             // //搜索结果点击后的数据
             map.setZoomAndCenter(14,[item.location.lng, item.location.lat]);
             $scope.keyword=item.name;
             // // clickHandler(item.id);
             $scope.showSearch=false;
             if (!$scope.$$phase) $scope.$apply();
         };
         $scope.clearKeyWord=function () {
            $scope.keyword='';
             $scope.showSearch=false;
         };
         $scope.toMaps=function () {
             $scope.isLoading=true;
             AMap.plugin(["AMap.Walking"], function() {
                 var drivingOption = {
                     map:map
                 };
                 if(walking){
                     walking.clear();
                 }
                walking = new AMap.Walking(drivingOption); //构造驾车导航类
                 //根据起终点坐标规划驾车路线
                 walking.search([{keyword:$scope.startAdress,city:'hangzhou'},{keyword:$scope.conditions.clubMessage.name,city:'hangzhou'}], function(status, result){
                     if(status=='complete'){
                         $scope.isLoading=false;
                         walking.searchOnAMAP({
                             origin:result.origin,
                             destination:result.destination
                         })
                     }

                 });
             });
         };
    }
    function detailCtrl($scope, $http){
          $scope.isLoading=false;
          $scope.clubDetail=club;
          $scope.showLeft=false;
          $scope.showRight=true;
          var walking;
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
            resizeEnable: true,
            dragEnable: false, // 地图是否可通过鼠标拖拽平移，默认为true
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
        window.onload=function () {
          var mySwiper = new Swiper('.swiper-container',{
              autoplay: true,//可选选项，自动滑动
              speed:300,
              pagination: {
                  el: '.swiper-pagination',
                  dynamicBullets: true
              }
          });
      }
      AMap.plugin('AMap.Geolocation', function() {
            geolocation.getCurrentPosition(function(status,result){
                if(status=='complete'){
                    $scope.position=result.position;
                    $scope.startAdress=result.formattedAddress;
                }else{
                    alert('定位失败！')
                }
            });
        });
        $scope.toMaps=function () {
            $scope.isLoading=true;
            AMap.plugin(["AMap.Walking"], function() {
                var drivingOption = {
                    map:map
                };
                if(walking){
                    walking.clear();
                }
                walking = new AMap.Walking(drivingOption); //构造驾车导航类
                //根据起终点坐标规划驾车路线
                walking.search([{keyword:$scope.startAdress,city:'hangzhou'},{keyword:$scope.clubDetail.name,city:'hangzhou'}], function(status, result){
                    if(status=='complete'){
                        $scope.isLoading=false;
                        walking.searchOnAMAP({
                            origin:result.origin,
                            destination:result.destination
                        })
                    }
                });
            });
        };

    }
    angular.module('fit88', [])
        .controller('listCtrl',['$scope','$http', listCtrl])
        .controller('detailCtrl', ['$scope','$http', detailCtrl]);
})();