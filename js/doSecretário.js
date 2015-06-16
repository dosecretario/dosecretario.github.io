// Adiciona .overflown() ao jQuery
$.fn.overflown=function(){var e=this[0];return e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth}
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function doSecretário (url) {
  this.calendario = null;
  this.urlCalendario = url;
  this.dom = null;
  this.horarios = [];
  this.alturas = [];

  this.criaDOM_nome = function () {
    var dom = $("<div class=\"nome\">"+this.calendario.nome+"</div>");

    $("#content").append(dom);

    this.dom.nome = dom;
  }

  this.criaDOM_horários = function (domDia, dados, selecionado) {
    var soma = 0;

    for (var i in dados) {
      var horario = dados[i];
      soma += horario[0];
    }

    var horario_atual = 0;
    var horario_antigo = 0;
    for (var i in dados) {
      var horario = dados[i];

      var num = horario[0];
      var nome = horario[1];

      horario_antigo = horario_atual;
      horario_atual += num;

      nome = nome.replace (/#\{([^#]*)\|([^#]*)\}/g, function (a, b, c) {
        return "<br><span onclick=\"showInfoFor('"+c+"')\" class=\"atividade\">"+""+b+"</span>";
      });

      var dom = $("<div class=\"horario\">"+nome+"</div>");

      var date = new Date();
      var minutes = date.getHours()*60+date.getMinutes()-7*60;

      if (minutes > 6*60)
        minutes -= 60;

      domDia.append(dom);


      if ((Math.floor(minutes/50) <= horario_atual &&
           Math.floor(minutes/50) > horario_antigo) && selecionado) {
        dom.css("background", "#ccf");
        dom.css("box-shadow", "0 0 2px 0 black inset");
      }

      this.horarios.push(dom);
      this.alturas.push(num/soma);
    }
  }

  this.criaDOM_dia = function (nome, destaca) {
    var dom = $("<div class=\"dia\"></div>");
    var dom_nome = $("<div class=\"titulo\">"+nome+"</div>");
    var tamanho_dia = 100/this.calendario.dias;

    dom.css("width", Math.floor(tamanho_dia)+"%");
    dom_nome.css("width", Math.floor(tamanho_dia)+"%");

    this.dom.barra.append(dom_nome);
    this.dom.calendario.append(dom);

    if (destaca) {
      dom_nome.css("box-shadow", "0 0 2px 0 black inset");
    }

    this.criaDOM_horários(dom, this.calendario[nome], destaca);

    this.dom.dias.push(dom);
  }

  this.criaDOM_dias = function () {
    this.dom.dias = [];
    this.dom.barra = $("<div class=\"barra\"></div>")
    this.dom.calendario = $("<div class=\"calendario\"></div>")

    $("#content").append(this.dom.barra);
    $("#content").append(this.dom.calendario);

    var ndia = 0;
    for (var chave in this.calendario) {
      if (chave != "nome" &&
          chave != "dias") {
          if ((new Date()).getDay() == ndia)
            this.criaDOM_dia(chave, true);
          else
            this.criaDOM_dia(chave, false);
      }

      ndia++;
    }

    this.dom.barra.append($("<div class=\"clear\"></div>"));
    this.dom.calendario.append($("<div class=\"clear\"></div>"));
  }

  this.criaDOM = function () {
    if (this.dom && this.dom.calendario)
      this.dom.calendario.remove();
    this.dom = {};

    if (this.calendario.nome) {
      console.info ("doSecretario nome: "+this.calendario.nome);
      this.criaDOM_nome();
    }

    this.criaDOM_dias();

    //$("#content").append($("<div class=\"rodape\">"+""+"</div>"));
    $("#content").append($("<div class=\"info\"><div class=\"info-texto\"></div></div>"));
    $("#content").append($("<div class=\"fechar\"></div>"));
  }

  this.semOverflow = function () {
    console.info ("doSecretário tentando remover overflow");

    this.dom.calendario.height(0);

    this.recalculaAlturas();

    for (var h in this.horarios) {
      var horario = this.horarios[h];

      while (horario.overflown()) {
        this.dom.calendario.height(this.dom.calendario.height()+24);
        this.recalculaAlturas();
      }
    }

    this.dom.calendario.height(this.dom.calendario.height()+48);

    var h = $(window).height()-$(".nome").height()-$(".barra").height()-40;

    if (this.dom.calendario.height() < h) {
        this.dom.calendario.height(h);
    }

    this.recalculaAlturas();

    console.info ("doSecretário altura final de "+this.dom.calendario.height()+"px");
  }

  this.recalculaAlturas = function () {
    for (var h in this.horarios) {
      var altura_horario = this.alturas[h]*this.dom.calendario.height();
      this.horarios[h].height(altura_horario-25);
    }
  }

  this.calendarioBaixado = function (dados) {
    console.info("doSecretário calendário baixado...");

    this.calendario = dados;
    this.calendario.dias = Object.keys(this.calendario).length-1;
    this.criaDOM();

    $.proxy(this.semOverflow, this)();
    $(".fechar").click(hideInfo);
  }

  this.baixaCalendario = function (url) {
    console.info("doSecretário baixando calendário...");
    console.info("de: '"+url+"'");

    $.ajax(url, {
      "success": $.proxy(this.calendarioBaixado, this)
    });
  }

  this.construct = function () {
    console.info("doSecretário iniciando...");

    this.baixaCalendario(this.urlCalendario);

    $(window).resize($.proxy (this.semOverflow, this));
  }

  this.construct();
}

function showInfoFor (data) {
  $(".info-texto").html(data);
  $(".info").fadeIn(300);
  $(".fechar").fadeIn(300);
}

function hideInfo () {
  $(".info").fadeOut(300);
  $(".fechar").fadeOut(300);
}
