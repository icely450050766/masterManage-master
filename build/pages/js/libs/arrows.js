$(function() {
  //点击表单的上下箭头进行筛选
  $(document).on('click', 'table[data-tableMain] th.sorting', function(ev) {
    var $this = $(this),
      tableMainVal = $this.parents('table').attr('data-tableMain'),
      tableBodyVal = $this.parents('table').find(
        'tbody[data-tableBody]').attr('data-tableBody');
    if (tableMainVal === tableBodyVal) {
      tableBody = $this.parents('table').find('tbody[data-tableBody]'),
        faDesc = 'fa-sort-desc',
        faEsc = 'fa-sort-asc',
        arrowIndex = $this.index(),
        cEvent = ev || event,
        cTop = cEvent.pageY;
      oTop = $this.offset().top,
        oHeight = parseInt($this.css('height')),
        myTHeight = oTop + oHeight / 2,
        myBHeight = oTop + oHeight;
      $(document).on('click', 'li.paging', function() {
        $this.removeClass(faEsc);
        $this.removeClass(faDesc);
      })
      if ($this.siblings().hasClass(faEsc) || $this.siblings().hasClass(
          faDesc)) {
        $this.siblings().removeClass(faEsc);
        $this.siblings().removeClass(faDesc);
      }

      //如果点击了上箭头
      if (cTop < myTHeight) {
        $this.removeClass(faDesc).addClass(faEsc);
        if ($this.hasClass('dataTime')) {
          function sortNumber(a, b) {
            var atext = a.etext;
            var btext = b.etext;
            return (new Date(btext) - new Date(atext))
          }
        } else {
          function sortNumber(a, b) {
            var atext = a.etext;
            var btext = b.etext;
            return btext - atext
          }
        }
        var arr = [];
        $this.parents('thead').next().find('tr').each(function() {
          var etext = $(this).children().eq(arrowIndex).text();
          arr.push({
            etext: etext,
            tr: this
          });
        })
        arr = arr.sort(sortNumber);
        var index = 0;
        $.each(arr, function(index, value) {
            tableBody.append(value.tr)
          })
          //如果点击了下箭头
      } else if (cTop >= myTHeight) {
        $this.removeClass(faEsc).addClass(faDesc);

        if ($this.hasClass('dataTime')) {
          function sortNumber(a, b) {
            var atext = a.etext;
            var btext = b.etext;
            return (new Date(atext) - new Date(btext))
          }
        } else {
          function sortNumber(a, b) {
            var atext = a.etext;
            var btext = b.etext;
            return atext - btext
          }
        }
        var arr = [];
        $this.parents('thead').next().find('tr').each(function() {
          var etext = $(this).children().eq(arrowIndex).text();
          arr.push({
            etext: etext,
            tr: this
          });
        })
        arr.sort(sortNumber);
        $.each(arr, function(index, value) {
          tableBody.append(value.tr)
        })
      }
    }
  })
})
