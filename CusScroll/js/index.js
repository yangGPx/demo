

(function (win,dom,$) {
	//发现的问题，滑块是根据鼠标的位置进行移动的，如果鼠标不在最开头点滑块就会出现滑块瞬移
	//解决思路：当点击滑块并进行move时，从新定义滑块的位置，根据滑块的position（）.top的位置进行移动
 /**
 * 1.先进行初始化，为滑块的高度，以及方法的函数，以及dom对象
 * 2.分别为滑块加上拖动事件，以及为内容去添加滚轮事件
 */
    function SelfScroll(options){
        this._init(options);
    }


    $.extend(SelfScroll.prototype,{
        /**
         * 初始化方法
         * @private
         */
        _init:function (options) {
            this.options={
                selectors:{
                    scrollContent:"",//内容区
                    scrollBar:"",//滚动区
                    scrollSlider:""//滑块
                },
                scrollStep:25//滚动步长
            };
            this.settings = $.extend(true,this.options,options);
            this._initDomEvent();
            this._initParams();
            this._scliderEvent();
            this._mouseScroll();
        },
        /**
         * 初始化dom对象
         */
        _initDomEvent:function () {
            var self = this;//缓存this
            self.$content = $(this.settings.selectors.scrollContent);
            self.$bar= $(this.settings.selectors.scrollBar);
            self.$slider= $(this.settings.selectors.scrollSlider);
            self.$dom = $(dom);
        },
        /**
         * 初始化在计算中需要的参数
         * 主要的公式为：内容滚动距离/内容可滚动距离长度 = 滑块滚动距离/（滑块可滚动距离-滑块长度）
         * 内容可滚动距离为 内容长度-显示区长度
         * 滑块长度也是比率得出的，这样可以随着内容的长度而进行不同的长度变化
         * 显示区长度/内容区长度 = 滑块长度/可滑动长度
         */
        _initParams:function () {
            var self = this;
            self.scrollHeight = self.$bar.height();//滑块可滚动距离 显示区长度
            self.contentHeight = self.$content.height();//内容长度
            self.sliderHeight = Math.floor(self.scrollHeight*self.scrollHeight/self.contentHeight);//滑块长度
            self.$slider.css("height",self.sliderHeight+"px");//设置滑块长度
            self.scrollContentHeight = self.contentHeight - self.scrollHeight;//内容可滚动距离
			self.scrollStep = self.settings.scrollStep;
			
            //如果内容不超过显示区，就不显示滑块
            if(self.scrollContentHeight<=0){
                scrollContentHeight = 0;
                self.$slider.hide();
            }
        },
        _scrollTo:function (sliderPosition,pagePosition) {
            var self = this;
            var pp = pagePosition;
            var sp = sliderPosition;
            if(sp<0){
                sp = Math.max(0,sliderPosition);//如果滑动为负值，就把它置为零
            }
            if(sp>self.scrollHeight-self.sliderHeight){
                sp = Math.min(self.scrollHeight-self.sliderHeight,sliderPosition);
            }
			if(pp<0){
                pp =0;//如果滑动为负值，就把它置为零
            }
            if(pp>self.scrollHeight-self.sliderHeight){
            	pp = Math.min(pp,self.scrollContentHeight);
            }
            

            self.$slider.css("transform","translateY("+sp+"px)");
            self.$content.css("transform","translateY(-"+pp+"px)");

        },
        /**
         * 对滑块进行进行事件绑定
         * 内容滚动距离/内容可滚动距离长度 = 滑块滚动距离/（滑块可滚动距离-滑块长度）
         */
        _scliderEvent:function () {
            var self = this;
            var pagePosition = 0,
                sliderPosition = 0;
            self.$slider.on("mousedown",function(e){
                 e.preventDefault();

                self.$dom.on("mousemove.scroll",function (e) {
                   e.preventDefault();
                    sliderPosition= e.pageY-100;//鼠标移动距离
                   pagePosition = Math.floor(self.scrollContentHeight *sliderPosition /(self.scrollHeight-self.sliderHeight));
                   self._scrollTo(sliderPosition,pagePosition);
               }) .on("mouseup.scroll",function(e){
                   e.preventDefault();
                   self.$dom.off(".scroll");
               })
            });
        },
        /**
         * 添加滚轮事件，滚轮事件只要鼠标在元素上就可以触发
         * 内容滚动距离/内容可滚动距离长度 = 滑块滚动距离/（滑块可滚动距离-滑块长度）
         */
        _mouseScroll:function () {
            var self = this;
            //分别为内容滚动距离，和滑块滚动距离
            self.$content.on("mousewheel DOMMouseScroll",function(e){//滚动事件，o.originalEvent.wheelDelta and detail
            	e.preventDefault();
            	var pp = -self.$content.position().top;
            	var sp = self.$slider.position().top;
            	var scrollCount = 0;//滚了几次滚轮
            	var scrollContHeight=0;//滚了多少内容
            	if(e.originalEvent.wheelDelta){
            		scrollCount = -e.originalEvent.wheelDelta/120;//向下滚动为1
            	}else if(e.originalEvent.detail){
            		scrollCount = e.originalEvent.detail/3;
            	}
                
                scrollContHeight += scrollCount*self.scrollStep;
                pp += scrollCount*self.scrollStep;
                sp += Math.floor((self.scrollHeight - self.sliderHeight)*scrollContHeight/self.scrollContentHeight)
                
                
                self._scrollTo(sp,pp);
            });
        }


    });

    win.SelfScroll = SelfScroll;

})(window,document,jQuery);

