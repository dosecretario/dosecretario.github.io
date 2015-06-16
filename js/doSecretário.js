// Adiciona .overflown() ao jQuery
$.fn.overflown=function(){var e=this[0];return e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth}

function doSecretário (url) {
  this.calendario = null;
  this.urlCalendario = url;
  this.dom = null;
  this.horarios = [];
  this.alturas = [];

  this.criaDOM_nome = function () {
    var dom = $("<div class=\"nome\">"+this.calendario.nome+"</div>");

    $(document.body).append(dom);

    this.dom.nome = dom;
  }

  this.criaDOM_horários = function (domDia, dados) {
    var soma = 0;

    for (var i in dados) {
      var horario = dados[i];
      soma += horario[0];
    }

    for (var i in dados) {
      var horario = dados[i];

      var num = horario[0];
      var nome = horario[1];

      nome = nome.replace (/#\{([^#]*)\|([^#]*)\}/g, function (a, b, c) {
        return "<br><span onclick=\"showInfoFor('"+c+"')\" class=\"atividade\">"+"# "+b+"</span>";
      });

      var dom = $("<div class=\"horario\">"+nome+"</div>");

      domDia.append(dom);

      this.horarios.push(dom);
      this.alturas.push(num/soma);
    }
  }

  this.criaDOM_dia = function (nome) {
    var dom = $("<div class=\"dia\"></div>");
    var dom_nome = $("<div class=\"titulo\">"+nome+"</div>");
    var tamanho_dia = 100/this.calendario.dias;

    console.log ("tamanho_dia: "+tamanho_dia);

    dom.css("width", Math.floor(tamanho_dia)+"%");
    dom_nome.css("width", Math.floor(tamanho_dia)+"%");

    this.dom.barra.append(dom_nome);
    this.dom.calendario.append(dom);

    this.criaDOM_horários(dom, this.calendario[nome]);

    this.dom.dias.push(dom);
  }

  this.criaDOM_dias = function () {
    this.dom.dias = [];
    this.dom.barra = $("<div class=\"barra\"></div>")
    this.dom.calendario = $("<div class=\"calendario\"></div>")

    $(document.body).append(this.dom.barra);
    $(document.body).append(this.dom.calendario);

    if (this.dom.calendario.height() < 24) {
    }

    for (var chave in this.calendario) {
      if (chave != "nome" &&
          chave != "dias") {
        this.criaDOM_dia(chave);
      }
    }

    this.dom.calendario.append($("<div class=\"clear\"></div>"));
  }

  this.criaDOM = function () {
    // TODO: Verificar se já existe um DOM e apagar

    this.dom = {};

    if (this.calendario.nome) {
      console.info ("doSecretario nome: "+this.calendario.nome);
      this.criaDOM_nome();
    }

    this.criaDOM_dias();

    $(document.body).append(
      $("<div class=\"rodape\">"+""+"</div>")
    );
    $(document.body).append($("<div class=\"info\"><div class=\"info-texto\"></div></div>"));
    $(document.body).append($("<div class=\"fechar\"></div>"));
  }

  this.semOverflow = function () {
    console.info ("doSecretário tentando remover overflow");

    this.dom.calendario.height(0);

    this.recalculaAlturas();

    for (var h in this.horarios) {
      var horario = this.horarios[h];

      while (horario.overflown()) {
        this.dom.calendario.height(this.dom.calendario.height()+25);
        this.recalculaAlturas();
      }
    }

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
