'use strict';
angular.module('app',['ui.router','validation','ngCookies']);
angular.module('app').value('dict',{}).run(['$http','dict',function($http,dict){
  $http.get('data/city.json').then(function(resp){
    dict.city=resp.data;
  });
  $http.get('data/salary.json').then(function(resp){
    dict.salary=resp.data;
  });
  $http.get('data/scale.json').then(function(resp){
    dict.scale=resp.data;
  });
}])
angular.module('app').config(['$provide',function($provide){
  $provide.decorator('$http',['$delegate','$q',function($delegate,$q){
    $delegate.post=function(url,data,config){
      var def=$q.defer();
      $delegate.get(url).then(function(resp){
        def.resolve(resp);
      }).catch(function(err){
        def.reject(err);
      });
      return {
        then:function(cb){
          def.promise.then(cb);
        },
        catch:function(cb){
          def.promise.then(null,cb);
        }
      }
    }
    return $delegate;
  }])
}])
angular.module('app').config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
  $stateProvider.state('main',{
    url:"/main",
    templateUrl:"view/main.html",
    controller:'mainCtrl'
  }).state('position',{/**/
    url:'/position/:id',
    templateUrl:'view/position.html',
    controller:'positionCtrl'
  }).state('company',{
    url:'/company/:id',
    templateUrl:'view/company.html',
    controller:'companyCtrl'
  }).state('search',{
    url:'/search',
    templateUrl:'view/search.html',
    controller:'searchCtrl'
  }).state('login',{
    url:'/login',
    templateUrl:'view/login.html',
    controller:'loginCtrl'
  }).state('me',{
    url:'/me',
    templateUrl:'view/me.html',
    controller:'meCtrl'
  }).state('post',{
    url:'/post',
    templateUrl:'view/post.html',
    controller:'postCtrl'
  }).state('rejistor',{
    url:'/rejistor',
    templateUrl:'view/rejistor.html',
    controller:'rejistorCtrl'
  }).state('favorite',{
    url:'/favorite',
    templateUrl:'view/favorite.html',
    controller:'favoriteCtrl'
  });
  $urlRouterProvider.otherwise('main');
}])
angular.module('app').config(['$validationProvider',function($validationProvider){
  var expression={
phone:/^1[\d]{10}$/,
password:function(value){
  var str=value+'';
  return str.length>5;
},
required:function(value){
  return !!value;
}
  };
  var defaultMsg={
    phone:{
      success:'',
      error:'必须是11位'
    },
    password:{
      success:'',
      error:'长度至少为6位'
    },
    required:{
      success:'',
      error:'不能为空'
    }
  };
  $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
}])
angular.module('app')
.controller('companyCtrl',['$http','$state','$scope',function($http,$state,$scope){
  $http.get('data/company.json?id='+$state.params.id).then(function(resp){
    $scope.company=resp.data;
  })
}])
angular.module('app').controller('favoriteCtrl',['$http','$scope',function($http,$scope){
  $http.get('data/myFavorite.json').then(function(resp){
    var res=resp.data;
    $scope.list=res;
  })
}])
angular.module('app').controller('loginCtrl',['$http','$scope','$state','cache',function($http,$scope,$state,cache){
  $scope.submit=function(){
    $http.post('data/login.json',$scope.user).then(function(resp){
      var res=resp.data;
      cache.put('id',res.id);
      cache.put('name',res.name);
      cache.put('image',res.image);
      $state.go('main');
    })
  }
}])
angular.module('app')
.controller('mainCtrl',['$scope','$http',function($scope,$http){
  $http.get('data/positionList.json').then(function(resp){
    console.log(resp);
    $scope.list=resp.data;
  })
  // $scope.list=[{
  //   name:'销售',
  //   companyName:'千度',
  //   imgSrc:'image/company-3.png',
  //   city:'上海',
  //   industry:'互联网',
  //   time:'2017-4-10 11:05',
  //   id:'1'
  // },{
  //   id:'2',
  //  name:'WEB前端',
  //   companyName:'慕课网',
  //   imgSrc:'image/company-1.png',
  //   industry:'互联网',
  //   city:'北京',
  //   time:'2017-4-5 01:10'
  // }];
}])
angular.module('app').controller('meCtrl',['$state','cache','$http','$scope',function($state,cache,$http,$scope){
    if(cache.get('name')){
      $scope.name=cache.get('name');
      $scope.image=cache.get('image');
    }
    $scope.logout=function(){
      cache.remove('id');
      cache.remove('name');
      cache.remove('image');
      $state.go('main');
    }
}])
angular.module('app').controller('positionCtrl',['$q','$scope','$state','$http','cache',function($q,$scope,$state,$http,cache){
  $scope.isLogin=!!cache.get('name');
  function getPosition(){
    var def=$q.defer();
  $http.get('data/position.json?id='+$state.params.id).then(function(resp){
    $scope.position=resp.data;
    def.resolve(resp);
    console.log($state.params.id);
});
  return def.promise;
}
function getCompany(id){
  $http.get('data/company.json?id='+id).then(function(resp){
    $scope.company=resp.data;
  })
}
getPosition().then(function(obj){
  getCompany(obj.companyId);
})
}])
angular.module('app').controller('postCtrl',['$http','$scope',function($http,$scope){
  $scope.tabList=[{
    id:'all',
    name:'全部'
  },{
    id:'pass',
    name:'面试邀请'
  },{
    id:'fail',
    name:'不合格'
  }];
  $http.get('data/myPost.json').then(function(resp){
    var res=resp.data;
    $scope.positionList=res;
  });
  $scope.filterObj={};
  $scope.tClick=function(id,name){
    switch(id){
      case 'all':
        delete $scope.filterObj.state;
        break;
      case 'pass':
        $scope.filterObj.state='1';
        break;   
      case 'fail':
        $scope.filterObj.state='-1';
        break;
      default: 
    }
  }
}])
angular.module('app').controller('rejistorCtrl',['$interval','$http','$scope','$state',function($interval,$http,$scope,$state){
  $scope.submit=function(){
    $http.post('data/regist.json',$scope.user).then(function(resp){
      console.log(resp);
      $state.go('login');
    })
  }
  var count=60;
  $scope.fn1=function(){
    $http.get('data/code.json').then(function(resp){
      console.log(resp);
      var res=resp.data;
      if(1===res.state){
        count=60;
       var interval= $interval(function(){
          $scope.time='60s';
          if(count<=0){
            $interval.cancel(interval);
            $scope.time='';
            return;
          }else{
          count--;
          $scope.time=count+'s';
          }
        },1000);
      }
    })
  }
}])
angular.module('app')
.controller('searchCtrl',['$scope','$http','dict',function($scope,$http,dict){
  $scope.name='';
  $scope.search=function(){
  $http.get('data/positionList.json?name='+$scope.name).then(function(resp){
    $scope.positionList=resp.data;
  });
}
$scope.search();
$scope.sheet={};
$scope.tabList=[{
  id:'city',
  name:'城市'
},{
  id:'salary',
  name:'薪水'
},{
  id:'scale',
  name:'公司规模'
}];
$scope.filterObj={};
var tabId='';
$scope.tClick=function(id,name){
  tabId=id;
  $scope.sheet.list=dict[id];
  $scope.sheet.visible=true;
};
$scope.sClick=function(id,name){
  if(id){
    angular.forEach($scope.tabList,function(item){
      if(item.id===tabId){
        item.name=name;
      }
    });
    $scope.filterObj[tabId+'Id']=id;
  }else{
    delete $scope.filterObj[tabId+'Id'];
    angular.forEach($scope.tabList,function(item){
      if(item.id===tabId){
        switch(item.id){
          case 'city':
           item.name="城市";
           break;
          case 'salary':
           item.name="薪水";
           break;
          case 'scale':
           item.name="公司规模";
           break;
           default:
        }
      }
  });
}
}
}])
angular.module('app').directive('appCompany',[function(){
  return {
    restirct:'A',
    replace:true,
    scope:{
      com:'='
    },
    templateUrl:'view/template/company.html'
  }
}])
angular.module('app').directive('appFoot',[function(){
  return {
    restrict:'A',
    replace:true,
    templateUrl:'view/template/foot.html'
  }
}])
angular.module('app')
.directive('appHead',['cache',function(cache){
  return {
    restirct:'A',
    replace:true,
    templateUrl:"view/template/head.html",
    link: function(scope){
      scope.name=cache.get('name')||'';
    }  
}
}])
angular.module('app')
.directive('appHeadBar',[function(){
  return {
    restirct:'A',
    replace:true,
    templateUrl:"view/template/headbar.html",
    scope:{
      text:'='
    },
    link:function(scope,ele,attr){
      scope.back=function(){
        window.history.back();
      }
    }
  }
}])
angular.module('app').directive('appPositionClas',[function(){
  return {
    restrict:'A',
    replace:true,
    scope:{
      com:'='
    },
    templateUrl:'view/template/positionclass.html',
    link:function(scope){
      scope.showPositionList=function(idx){
        scope.positionList=scope.com.positionClass[idx].positionList;
        scope.isActive=idx;
      }
    }
  }
}])
angular.module('app').directive('appPositionInfo',[function(){
  return { 
    restirct:'A',
    replace:true,
    templateUrl:'view/template/positioninfo.html',
    scope:{
      isActive:'=',
      isLogin:'=',
      pos:'='
    },
    link:function(scope){
      scope.imagePath=scope.isActive?'image/star-active.png':'image/star.png';
    }
  }
}])
angular.module('app').directive('appPositionList',['$http',function($http){
  return {
    restrict:'A',
    replace:true,
    templateUrl:'view/template/positionlist.html',
    scope:{
      data:'=',
      filterObj:'=',
      isFavorite:'='
    },
    link:function(scope){
      scope.select=function(item){
        $http.post('data/favorite.json',{
          id:item.id,
          select:!item.scope
        }).then(function(resp){
        item.select=!item.select;
        })
      }
    }
  }  
}])
angular.module('app').directive('appSheet',[function(){
  return {
    restrict:'A',
    replace:true,
    scope:{
      list:'=',
      visible:'=',
      select:'&'
    },
    templateUrl:'view/template/sheet.html'
  }
}])
angular.module('app').directive('appTab',[function(){
  return {
    restrict:'A',
    replace:true,
    scope:{
      list:'=',
      tabClick:'&'
    },
    templateUrl:'view/template/tab.html',
    link:function(scope){
      scope.click=function(tab){
        scope.selectId=tab.id;
        scope.tabClick(tab);
      }
    }
  }
}])
angular.module('app').filter('filterByObj',[function(){
  return function(list,obj){
    var result=[];
    angular.forEach(list,function(item){
      var isEqual=true;
      for(var e in obj){
        if(item[e]!==obj[e]){
          isEqual=false;
        }
      }
      if(isEqual){
        result.push(item);
      }
    })
    return result;
  }
}]);
angular.module('app').service('cache',['$cookies',function($cookies){
  this.put=function(key,value){
    $cookies.put(key,value);
  };
  this.get=function(key){
    return $cookies.get(key);
  };
  this.remove=function(key){
    $cookies.remove(key);
  }
}])