importScripts('https://cdn.jsdelivr.net/npm/js-combinatorics@0.5.5/combinatorics.min.js');

var AoEHeroes = ["solitaria-of-the-snow","bomb-model-kanna","designer-lilibet","eda","politis","archdemons-shadow","fairytale-tenebria","mort","operator-sigret","ainos","ian","landy","last-rider-krau","choux","doll-maker-pearlhorizon","briar-witch-iseria","holiday-yufine","mui","adventurer-ras","kawerik","cerise","dark-tyrant-tenebria","specter-tenebria","tempest-surin","pavel","ambitious-tywin","alencia","benevolent-romann","elena","cecilia","vildred","charlotte","baal-sezan","yufine","ravi","kayron","charles","yuna","sez","haste","tywin","lidica","aramintha","tenebria","basar","tamarinne","ludwig","bellona","luluca","zeno","vivian","lilias","dizzy","faithless-lididca","fallen-cecilia","judge-kise","arbiter-vildred","sage-baal-sezan","specimen-sez","martial-artist-ken","silver-blade-aramintha","desert-jewel-basar","seaside-bellona","silk","mercedes","armin","zerato","corvus","cartuja","schuri","dingo","clarissa","leo","purrgis","crozet","dominiel","romann","khawana","shadow-rose","celestial-mercedes","champion-zerato","blood-blade-karin","watcher-schuri","blaze-dingo","kitty-clariss","roaming-warrior-leo","auxiliary-lots","general-purrgis","ras","sven","church-of-ilryos-axe","rikoris","adlay","carrot","jena","jecht","elson","hurado","kiris","celeste","pearlhorizon","gloomyrain","kikirat-v2","chaos-sect-axe","captain-rikoris","researcher-carrot","lena"];
var dispelHeroes = ["adventurer-ras","alencia","arowell","basar","bask","bellona","benevolent-romann","blood-moon-haste","bomb-model-kanna","briar-witch-iseria","butcher-corps-inquisitor","captain-rikoris","carmainerose","cecilia","chaos-inquisitor","charles","chloe","crescent-moon-rin","eda","elphelt","faithless-lidica","falconer-kluri","flan","hurado","ian","iseria","kawerik","kikirat-v2","kitty-clarissa","lidica","ludwig","melissa","mui","operator-sigret","politis","ras","rikoris","rin","romann","sage-baal-sezan","shadow-rose","sol","solitaria-of-the-snow","tamarinne","taranor-royal-guard","tywin","watcher-schuri","yufine"];
var topics_results = {};
var scHeroes = {
                "kluri": "falconer-kluri",
                "butcher-corps-inquisitor": "chaos-inquisitor",
                "roozid" : "righteous-thief-roozid",
                "helga": "mercenary-helga",
                "church-of-ilryos-axe": "chaos-sect-axe",
                "rikoris": "captain-rikoris",
                "lorina": "commander-lorina",
                "hazel": "mascot-hazel",
                "montmorancy": "angelic-montmorancy",
                "carrot": "researcher-carrot",
                "wanda": "allrounder-wanda",
                "ras": "adventurer-ras",
                "pearlhorizon": "doll-maker-pearlhorizon",
                "doris": "magic-scholar-doris",
                "carmainerose": "zealot-carmainerose"
               };

if (!Array.prototype.flat) {
    Object.defineProperty(Array.prototype, 'flat', {
      value: function(depth = 1) {
        return this.reduce(function (flat, toFlatten) {
          return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
        }, []);
      }
    });
};

//// SUPPORT FUNCTIONS
function everyLocked(team, lock) {
    for (var i = 0; i < lock.length; i++) {
      if (!team.includes(lock[i])) {
        return false;
      };
    };
    return true;
};

function checkScDupe (team) {
    for (var i = 0; i<team.length; i++){
        if (scHeroes[team[i]] && team.includes(scHeroes[team[i]])) {
            return true;
        };
    };
    return false;
};
function hasDuplicates(array) {
    return array.some((val, i) => array.indexOf(val) !== i);
};
function giaInTop(team, top) {
    if (top.length > 0 ) {
      for (var i = 0; i<top.length;i++) {
        if (top[i].morale === -100) break;
        if (top[i].team.includes(team[0]) && top[i].team.includes(team[1]) && top[i].team.includes(team[2]) && top[i].team.includes(team[3]) ) {
          return i;
        };
      };
    };
    return -1;
};

//******************** Check required class ********************/
var knights = 0, warriors = 0, assassins = 0, rangers = 0, mages = 0, manausers = 0;
function setRequestedClass (classe) {
    if (classe.length>0)
        for (var i = 0; i < classe.length; i++){
            if (classe[i] === "knight") knights++
            else if (classe[i] === "warrior") warriors++
            else if (classe[i] === "assassin") assassins++
            else if (classe[i] === "ranger") rangers++
            else if (classe[i] === "mage") mages++
            else if (classe[i] === "manauser") manausers++
        };
};
function checkHeroClass(team, HeroDB) {
    var _knights = 0, _warriors = 0, _assassins = 0, _rangers = 0, _mages = 0, _manausers = 0;
    for (var i = 0; i < team.length; i++) {
        var thisHeroClass = HeroDB[team[i]].role;
        if (thisHeroClass === "knight") _knights++
        else if (thisHeroClass === "warrior") _warriors++
        else if (thisHeroClass === "assassin") _assassins++
        else if (thisHeroClass === "ranger") _rangers++
        else if (thisHeroClass === "mage") _mages++
        else if (thisHeroClass === "manauser") _manausers++
    };

    if (_knights >= knights && _warriors >= warriors && _assassins >= assassins && _rangers >= rangers && _mages >= mages && _manausers >= manausers)
        return true;

    return false;
};

onmessage = function(e) {
         var e = e.data;
         e.risultati = [];
         var HeroDB = e.HeroDB;
         var campList = e.campList;
         knights = 0, warriors = 0, assassins = 0, rangers = 0, mages = 0, manausers = 0;
         var isCartesian = e.cartesianLock.flat().length>0 ? true : false;
         console.log("Is cartesian product? " + isCartesian)

         const nuovoCampSimulatorTeam2 = function(inputTeam) {
              let pg1 = inputTeam[0];
              let pg2 = inputTeam[1];
              let pg3 = inputTeam[2];
              let pg4 = inputTeam[3];

              var tabConTagNome = [
                    {personaggio: HeroDB[pg1]._id, opzione: HeroDB[pg1].camping.topics[0],risultato: HeroDB[pg2].camping.values[HeroDB[pg1].camping.topics[0]]+HeroDB[pg3].camping.values[HeroDB[pg1]. camping.topics[0]]+HeroDB[pg4].camping.values[HeroDB[pg1].camping.topics[0]]},
                    {personaggio: HeroDB[pg1]._id, opzione: HeroDB[pg1].camping.topics[1],risultato: HeroDB[pg2].camping.values[HeroDB[pg1].camping.topics[1]]+HeroDB[pg3].camping.values[HeroDB[pg1].camping.topics[1]]+HeroDB[pg4].camping.values[HeroDB[pg1].camping.topics[1]]},
                    {personaggio: HeroDB[pg2]._id, opzione: HeroDB[pg2].camping.topics[0],risultato: HeroDB[pg1].camping.values[HeroDB[pg2].camping.topics[0]]+HeroDB[pg3].camping.values[HeroDB[pg2].camping.topics[0]]+HeroDB[pg4].camping.values[HeroDB[pg2].camping.topics[0]]},
                    {personaggio: HeroDB[pg2]._id, opzione: HeroDB[pg2].camping.topics[1],risultato: HeroDB[pg1].camping.values[HeroDB[pg2].camping.topics[1]]+HeroDB[pg3].camping.values[HeroDB[pg2].camping.topics[1]]+HeroDB[pg4].camping.values[HeroDB[pg2].camping.topics[1]]},
                    {personaggio: HeroDB[pg3]._id, opzione: HeroDB[pg3].camping.topics[0],risultato: HeroDB[pg1].camping.values[HeroDB[pg3].camping.topics[0]]+HeroDB[pg2].camping.values[HeroDB[pg3].camping.topics[0]]+HeroDB[pg4].camping.values[HeroDB[pg3].camping.topics[0]]},
                    {personaggio: HeroDB[pg3]._id, opzione: HeroDB[pg3].camping.topics[1],risultato: HeroDB[pg1].camping.values[HeroDB[pg3].camping.topics[1]]+HeroDB[pg2].camping.values[HeroDB[pg3].camping.topics[1]]+HeroDB[pg4].camping.values[HeroDB[pg3].camping.topics[1]]},
                    {personaggio: HeroDB[pg4]._id, opzione: HeroDB[pg4].camping.topics[0],risultato: HeroDB[pg1].camping.values[HeroDB[pg4].camping.topics[0]]+HeroDB[pg2].camping.values[HeroDB[pg4].camping.topics[0]]+HeroDB[pg3].camping.values[HeroDB[pg4].camping.topics[0]]},
                    {personaggio: HeroDB[pg4]._id, opzione: HeroDB[pg4].camping.topics[1],risultato: HeroDB[pg1].camping.values[HeroDB[pg4].camping.topics[1]]+HeroDB[pg2].camping.values[HeroDB[pg4].camping.topics[1]]+HeroDB[pg3].camping.values[HeroDB[pg4].camping.topics[1]]}
              ];


              //Ordina per risultato
              tabConTagNome.sort(function(a, b) {
                  return ((a.risultato > b.risultato) ? -1 : ((a.risultato == b.risultato) ? 0 : 1));
              });   

               while (tabConTagNome[0].opzione === tabConTagNome[1].opzione) {
                  tabConTagNome.splice(1, 1);
               };
                var campMiglioreRisultato1 = tabConTagNome[0].risultato;
                var campNomeMigliorScelta1 = tabConTagNome[0].opzione;
                var campMigliorePG1 = tabConTagNome[0].personaggio;

                var campMiglioreRisultato2 = tabConTagNome[1].risultato;
                var campNomeMigliorScelta2 = tabConTagNome[1].opzione;
                var campMigliorePG2 = tabConTagNome[1].personaggio;

                 var moraleTotaleGuadagnato = campMiglioreRisultato1 + campMiglioreRisultato2;

              let soluzioni = {}; 
                  soluzioni.morale = moraleTotaleGuadagnato;
                  soluzioni.opzioneMigliore1 = campNomeMigliorScelta1;
                  soluzioni.risultatoScelta1 = campMiglioreRisultato1;
                  soluzioni.opzioneMigliore2 = campNomeMigliorScelta2;
                  soluzioni.risultatoScelta2 = campMiglioreRisultato2;
                  soluzioni.migliorPG1 = campMigliorePG1;
                  soluzioni.migliorPG2 = campMigliorePG2;
                  soluzioni.team = [HeroDB[pg1]._id,HeroDB[pg2]._id,HeroDB[pg3]._id,HeroDB[pg4]._id];
              return soluzioni;
            };

                // both sc and normal hero are locked: throw error
                if (checkScDupe(e.locked)) return postMessage({error: "locked_sc_normal_err"});

                if (isCartesian === false) {
                    var hasAdvSettings = false;
                    if ( ((e.locked.length + e.classe.length) > 4 && !e.preferenzeRisultati.lockedMatter) || ((e.locked.length + e.elemento.length) > 4 && !e.preferenzeRisultati.lockedMatter) || e.elemento.length > 4) { // team size error
                        return postMessage({error: "team_size_exceeded"});
                    } else { // can calculate
                        var useExperimental = true; // set to false if the new loop is not working correctly
                        if (e.classe.length > 0 || e.elemento.length > 0 || e.debuffs.length > 0 || e.buffs.length > 0 || e.AoE === true || e.noS1debuffs === true || e.noDebuffs === true || e.mustIncludeDispel || e.preferenzeRisultati.n > 2000) hasAdvSettings = true;
                        if (e.type == "friendship") hasAdvSettings = false;
                        if (useExperimental && hasAdvSettings === false && e.locked.length <= 1) { // use only with no advanced settings
                            if (Object.keys(topics_results).length === 0) { // create topics combos (once for page visit)
                                for (var hero_id in HeroDB) {
                                    var topic_combos = Combinatorics.combination(Object.keys(HeroDB[hero_id].camping.values),2).toArray();
                                    for ( var i = 0; i<topic_combos.length; i++) {
                                      var key = topic_combos[i];
                                      if (!topics_results[key.join("_")]) {topics_results[key.join("_")] = {}; topics_results[key.join("_")]["eroi"] = []; topics_results[key.join("_")][key[0]] = [];  topics_results[key.join("_")][key[1]] = [];};
                                      if (HeroDB[hero_id].camping.topics.includes(key[0]) ) topics_results[key.join("_")][key[0]].push({"_id": HeroDB[hero_id]._id, punteggio: HeroDB[hero_id].camping.values[key[1]]});
                                      if (HeroDB[hero_id].camping.topics.includes(key[1]) ) topics_results[key.join("_")][key[1]].push({"_id": HeroDB[hero_id]._id, punteggio: HeroDB[hero_id].camping.values[key[0]]});
                                      topics_results[key.join("_")]["eroi"].push( {"_id": HeroDB[hero_id]._id, punteggio: HeroDB[hero_id].camping.values[key[0]]+HeroDB[hero_id].camping.values[key[1]]} );
                                      topics_results[key.join("_")]["eroi"].sort(function (a,b) {return ((a.punteggio > b.punteggio) ? -1 : ((a.punteggio == b.punteggio) ? 0: 1))});
                                      topics_results[key.join("_")][key[0]].sort(function (a,b) {return ((a.punteggio > b.punteggio) ? -1 : ((a.punteggio == b.punteggio) ? 0: 1))});
                                      topics_results[key.join("_")][key[1]].sort(function (a,b) {return ((a.punteggio > b.punteggio) ? -1 : ((a.punteggio == b.punteggio) ? 0: 1))});
                                    };
                                };
                            };
                            e.risultati = Array(e.preferenzeRisultati.n).fill({morale: -100, opzioneMigliore1: "", opzioneMigliore2: "", migliorPG1: "", migliorPG2: "", team: []});
                            for(key in topics_results){
                                var currArray = topics_results[key];
                                campList = Object.keys(e.myHeroesList);
                                for(var id in currArray){
                                  for(var i = 0; i < currArray[id].length; i++){
                                    if(campList.includes(currArray[id][i]._id) || e.locked.includes(currArray[id][i]._id)){
                                      currArray[id][i].roster = true;
                                    } else {
                                      currArray[id][i].roster = false;
                                    };
                                  };
                                };
                            };


                            if (e.type=="friendship"){ // calculate highest friendship -> Only 1 character supported, no advanced settings
                              for (var key in topics_results) {
                                  var currTopicCombo = topics_results[key];
                                  var index = null;
                                  for (var j=0; j<e.locked.length;j++) {
                                    for (var i=0; i<topics_results[key].eroi.length;i++)
                                      if (currTopicCombo.eroi[i]._id == e.locked[j])
                                        if (currTopicCombo.eroi[i].punteggio > e.risultati[e.risultati.length-1].morale) index = i;
                                  };
                                  if (!index) continue;
                                  for (var i = 0; i < currTopicCombo[key.split("_")[0]].length; i++) {
                                      if (!currTopicCombo[key.split("_")[0]][i].roster) {
                                          continue;
                                      };
                                      var c1p = currTopicCombo[key.split("_")[0]][i].punteggio;
                                      var c1 = currTopicCombo[key.split("_")[0]][i]._id;
                                      for (var w = 0; w < currTopicCombo[key.split("_")[1]].length; w++) {
                                          var c2p = currTopicCombo[key.split("_")[1]][w].punteggio;
                                          var c1data = currTopicCombo[key.split("_")[1]][w];
                                          var c2 = currTopicCombo[key.split("_")[1]][w]._id;
                                          if (!currTopicCombo[key.split("_")[1]][w].roster) {
                                              continue;
                                          };
                                          var punteggio = 0;
                                          if (e.locked.includes(c1) || e.locked.includes(c2)) {
                                            punteggio = e.locked.includes(c1) ? (e.locked.includes(c2) ? 0 : c1p) : (e.locked.includes(c2) ? c2p : 0);
                                          } else {
                                            punteggio = currTopicCombo.eroi[index].punteggio; 
                                          }
                                          for (var y = 0; y < e.risultati.length; y++) {
                                              if (punteggio >= e.risultati[y].morale) {
                                                  var team = c1 != c2 ? [c1,c2]:[c1];
                                                  for (var j=0; j<e.locked.length; j++) {
                                                    if (!team.includes(e.locked[j])) team.push(e.locked[j]);
                                                  };
                                                  if (punteggio === e.risultati[y].morale && team.length > e.risultati[y].team.length) continue; /* Preoritize smaller teams for more team building flexibility */
                                                  if (checkScDupe(team)) {
                                                      break; /* dupe character detected */
                                                  };
                                                  var inTop = -1;
                                                  for (var k = 0; k<e.risultati.length;k++) {
                                                    if (e.risultati[k].morale === -100) break;
                                                    if (e.risultati[k].team.length == team.length && e.risultati[k].team.every(y => team.includes(y))) {
                                                      inTop = k;
                                                    };
                                                  };
                                                  if (inTop === -1) {
                                                      e.risultati.splice(y, 0,  {morale: punteggio, opzioneMigliore1: key.split("_")[0], opzioneMigliore2: key.split("_")[1], migliorPG1: c1, migliorPG2: c2, team: team} );
                                                      e.risultati.splice(e.preferenzeRisultati.n, 1);
                                                  } else if (inTop >= y) {
                                                      e.risultati.splice(inTop, 1);
                                                      e.risultati.splice(y, 0,  {morale: punteggio, opzioneMigliore1: key.split("_")[0], opzioneMigliore2: key.split("_")[1], migliorPG1: c1, migliorPG2: c2, team: team} );
                                                  };
                                                  break;
                                              };
                                          };
                                      }; // var e
                                  };// var i
                                };
                                for (var i = 0; i < e.risultati.length; i++) {
                                  if (e.risultati[i].morale==-100) { // remove placeholders
                                    e.risultati.splice(i);
                                    break;
                                  } else { // Sort locked heroes in the team
                                    e.risultati[i].team.sort(function(a,b){
                                      return e.locked.includes(a) ? 1 : -1;
                                    })
                                  };
                                };
                                return postMessage({risultati: e.risultati}); //worker is done
                            }; // end of friendship calc


                            for (var key in topics_results) {
                                var currTopicCombo = topics_results[key];
                                for (var i = 0; i < currTopicCombo[key.split("_")[0]].length; i++) {
                                    if (!currTopicCombo[key.split("_")[0]][i].roster || (e.preferenzeRisultati.advMuteLocked && e.locked.includes(currTopicCombo[key.split("_")[0]][i]._id)) ) {
                                        continue;
                                    }; //!campList.includes(c2)
                                    var c1p = currTopicCombo[key.split("_")[0]][i].punteggio;
                                    var c1 = currTopicCombo[key.split("_")[0]][i]._id;
                                    for (var w = 0; w < currTopicCombo[key.split("_")[1]].length; w++) {
                                        var c2p = currTopicCombo[key.split("_")[1]][w].punteggio;
                                        var c1data = currTopicCombo[key.split("_")[1]][w];
                                        var c2 = currTopicCombo[key.split("_")[1]][w]._id;
                                        if (!currTopicCombo[key.split("_")[1]][w].roster || (e.preferenzeRisultati.advMuteLocked && e.locked.includes(c2)) ) {
                                            continue;
                                        };
                                        if (c1 === c2) {
                                            for (var i1 = 0; i1 < currTopicCombo.eroi.length; i1++) {
                                                c2 = currTopicCombo.eroi[i1]._id;
                                                if (!currTopicCombo.eroi[i1].roster || c2 == c1) continue;
                                                for (var i2 = i1+1; i2 < currTopicCombo.eroi.length; i2++) {
                                                    let canContinue = true;
                                                    var c3 = currTopicCombo.eroi[i2]._id;
                                                    if (!currTopicCombo.eroi[i2].roster || c3 == c1) continue;
                                                    for (var i3 = i2+1; i3 < currTopicCombo.eroi.length; i3++) {
                                                        var c4 = currTopicCombo.eroi[i3]._id;
                                                        if (!currTopicCombo.eroi[i3].roster || c4 == c1) continue;
                                                        var punteggio = 0 + currTopicCombo.eroi[i1].punteggio + currTopicCombo.eroi[i2].punteggio + currTopicCombo.eroi[i3].punteggio;
                                                        if (e.risultati[e.risultati.length-1].morale > punteggio || (e.preferenzeRisultati.minMorale === true && e.preferenzeRisultati.morale > punteggio) ) {
                                                            if (i3 == i2+1) canContinue = false;
                                                            break;
                                                        };
                                                        for (var y = 0; y < e.risultati.length; y++) {
                                                            if (punteggio >= e.risultati[y].morale) {
                                                                var team = [c1,c2,c3,c4];
                                                                if (checkScDupe(team)) {
                                                                    break; // dupe character detected
                                                                };
                                                                if (!(everyLocked(team, e.locked))) {
                                                                    break; // break da risultati
                                                                };
                                                                var inTop = giaInTop(team, e.risultati);
                                                                if (inTop === -1) {
                                                                    e.risultati.splice(y, 0,  {morale: punteggio, opzioneMigliore1: key.split("_")[0], opzioneMigliore2: key.split("_")[1], migliorPG1: c1, migliorPG2: c1, team: team} );
                                                                    e.risultati.splice(e.preferenzeRisultati.n, 1);
                                                                } else if (inTop >= y) {
                                                                    e.risultati.splice(inTop, 1);
                                                                    e.risultati.splice(y, 0,  {morale: punteggio, opzioneMigliore1: key.split("_")[0], opzioneMigliore2: key.split("_")[1], migliorPG1: c1, migliorPG2: c1, team: team} );
                                                                };
                                                                break;
                                                            };
                                                        };
                                                    }; // for var i3
                                                    if (!canContinue) break;
                                                }; // for var i2
                                            }; //for var i1
                                        } else {
                                            for (var i1 = 0; i1 < currTopicCombo.eroi.length; i1++) {
                                                let canContinue = true;
                                                var c3 = currTopicCombo.eroi[i1]._id;
                                                if (!currTopicCombo.eroi[i1].roster || c3 == c1 || c3 == c2) continue;
                                                for (var i2 = i1+1; i2 < currTopicCombo.eroi.length; i2++) {
                                                    var c4 = currTopicCombo.eroi[i2]._id;
                                                    if (!currTopicCombo.eroi[i2].roster || c4 == c1 || c4 == c2) continue;
                                                    var punteggio = c1p + c2p + currTopicCombo.eroi[i1].punteggio + currTopicCombo.eroi[i2].punteggio;
                                                    if (e.risultati[e.risultati.length-1].morale > punteggio || (e.preferenzeRisultati.minMorale === true && e.preferenzeRisultati.morale > punteggio) ) {
                                                        if (i2==i1+1) canContinue = false;
                                                        break;
                                                    };
                                                    for (var y = 0; y < e.risultati.length; y++) {
                                                        if (punteggio >= e.risultati[y].morale) {
                                                            var team = [c1,c2,c3,c4];
                                                            if (checkScDupe(team)) {
                                                                break; // dupe character detected
                                                            };
                                                            if (!(everyLocked(team, e.locked))) {
                                                                break; // break da risultati
                                                            };
                                                            var inTop = giaInTop(team, e.risultati);
                                                            if (inTop === -1) {
                                                                e.risultati.splice(y, 0,  {morale: punteggio, opzioneMigliore1: key.split("_")[0], opzioneMigliore2: key.split("_")[1], migliorPG1: c1, migliorPG2: c2, team: team} );
                                                                e.risultati.splice(e.preferenzeRisultati.n, 1);
                                                            } else if (inTop >= y) {
                                                                e.risultati.splice(inTop, 1);
                                                                e.risultati.splice(y, 0,  {morale: punteggio, opzioneMigliore1: key.split("_")[0], opzioneMigliore2: key.split("_")[1], migliorPG1: c1, migliorPG2: c2, team: team} );
                                                            };
                                                            break;
                                                        };
                                                    };
                                                }; // for var i2
                                                if (!canContinue) break;
                                            }; // for var i1
                                        }; // if c1 === c2
                                    }; // var e
                                };// var i
                              };
                              for (var i = 0; i < e.risultati.length; i++) {
                                if (e.risultati[i].team.length<3) { // remove placeholders
                                  e.risultati.splice(i);
                                  break;
                                } else { // Sort locked heroes in the team
                                  e.risultati[i].team.sort(function(a,b){
                                    return e.locked.includes(a) ? 1 : -1;
                                  })
                                };
                             };
                        } else {
                            e.risultati = Array(e.preferenzeRisultati.n).fill({morale: -100, team: []});
                            setRequestedClass(e.classe);
                            var currIndex = 0;
                            var lastProgress = -1;
                            var tot = Combinatorics.bigCombination(campList,4-e.locked.length).length.valueOf();
                            Combinatorics.bigCombination(campList,4-e.locked.length).forEach(teamComb => {
                                //Progress Bar
                                currIndex++
                                if (lastProgress !== Math.round(currIndex * 100 / tot))
                                    lastProgress = Math.round(currIndex * 100 / tot),
                                    postMessage({"status": Math.round(currIndex * 100 / tot) });

                                if (teamComb.length>4 || e.locked.length == 4) teamComb = []; // Se locked = 4 allora team deve riportare array vuota
                                var team = [].concat(teamComb, e.locked);
                                let elementoFiltro = e.preferenzeRisultati.lockedMatter === true ? team : teamComb;
                                if (checkScDupe(team))
                                    return;

                                if (e.classe.length > 0 && !checkHeroClass(elementoFiltro, HeroDB))
                                    return;

                                if (!e.locked.every(i => team.includes(i)))
                                    return;
                                
                                /*if (e.classe.length > 0 && !e.classe.every(i => elementoFiltro.map(function (hero, i) { return HeroDB[hero].role }).flat().includes(i))) 
                                    return;*/

                                if (e.elemento.length > 0 && !e.elemento.every(i => elementoFiltro.map(function (hero, i) { return HeroDB[hero].attribute }).flat().includes(i)))
                                    return;

                                if (e.buffs.length > 0 && !e.buffs.every(i => elementoFiltro.map(function (hero, i) { return HeroDB[hero].buffs }).flat().includes(i)))
                                    return;

                                if (e.debuffs.length > 0 && !e.debuffs.every(i => elementoFiltro.map(function (hero, i) { return HeroDB[hero].debuffs }).flat().includes(i)))
                                    return;

                                if (e.noS1debuffs && elementoFiltro.map(function (hero, i) { return HeroDB[hero].skills[0].debuff }).flat().filter(function (team) {return team != 20 && team != 25 && team != 21 && team != 24}).length != 0)
                                    return;

                                if (e.noDebuffs && elementoFiltro.map(function (hero, i) { return HeroDB[hero].debuffs }).flat().filter(function (team) {return team != 20 && team != 25 && team != 21 && team != 24}).length != 0)
                                    return;

                                if (e.AoE && !AoEHeroes.some(i => elementoFiltro.includes(i)) )
                                    return;

                                if (e.mustIncludeDispel && !dispelHeroes.some(i => elementoFiltro.includes(i)))
                                    return;

                                let risultatoDiQuestoTeam = nuovoCampSimulatorTeam2(team);
                              
                                if (e.preferenzeRisultati.advMuteLocked && (e.locked.includes(risultatoDiQuestoTeam.migliorPG1) || e.locked.includes(risultatoDiQuestoTeam.migliorPG2)) )
                                    return;

                                if (e.risultati[e.risultati.length-1].morale >= risultatoDiQuestoTeam.morale || (e.preferenzeRisultati.minMorale === true && e.preferenzeRisultati.morale > risultatoDiQuestoTeam.morale) )
                                    return;

                                for (var i = 0; i<e.risultati.length;i++) {
                                    if (risultatoDiQuestoTeam.morale >= e.risultati[i].morale) {
                                        e.risultati.splice(i, 0, risultatoDiQuestoTeam );
                                        e.risultati.splice(e.preferenzeRisultati.n, 1);
                                        break;
                                    };
                                };
                            });
                            if (e.risultati[e.risultati.length-1].team.length<3)
                                for (var i = 0; i < e.risultati.length; i++) {
                                    if (e.risultati[i].team.length<3) { // remove placeholders
                                        e.risultati.splice(i);
                                        break;
                                    };
                                };
                        };
                    };
                } else if (isCartesian === true) {
                    function printCombos(array) {
                        var results = [[]];
                        for (var i = 0; i < array.length; i++) {
                            var currentSubArray = array[i];
                            var temp = [];
                            for (var j = 0; j < results.length; j++) {
                                for (var k = 0; k < currentSubArray.length; k++) {
                                    if ( hasDuplicates(results[j].concat(currentSubArray[k])) ) continue;
                                    temp.push(results[j].concat(currentSubArray[k]));
                                }
                            }
                            results = temp;
                        }
                        return results;
                    };
                    for (var i=0; i < e.cartesianLock.length; i++){
                        if (!e.cartesianLock[i].length) {e.cartesianLock.splice(i, 1);i--}
                    };
                    for (var i = 0; i < campList.length; i++){
                        var tmp = e.cartesianLock.flat();
                        if (tmp.includes(campList[i]) ) {campList.splice(i, 1);i--}
                    };
                    if ((e.cartesianLock.length + e.locked.length) < 4 && campList.length < 4-(e.cartesianLock.length + e.locked.length)) { // can't calculate not enough heroes to fill remaining slots
                        return postMessage({error: "not_enough_heroes"});
                    } else if ( ((e.cartesianLock.length + e.locked.length + e.classe.length) > 4 && !e.preferenzeRisultati.lockedMatter) || ((e.cartesianLock.length + e.locked.length + e.elemento.length) > 4 && !e.preferenzeRisultati.lockedMatter)) { // Too many locked heroes
                        return postMessage({error: "team_size_exceeded"});
                    } else { // can calculate 
                        e.risultati = Array(e.preferenzeRisultati.n).fill({morale: -100, team: []});
                        setRequestedClass(e.classe);
                        if ( (e.cartesianLock.length + e.locked.length) > 3 ) campList = ["Ras"]; // placeholder Ras if all heroes are used in multilock or lock-> avoid RangeError
                        var c = printCombos(e.cartesianLock);
                        var currIndex = 0;
                        var lastProgress = -1;
                        var tot = (Combinatorics.bigCombination(campList,4-e.locked.length-c[0].length).length * c.length).valueOf();
                        c.forEach( (cartesianLocked) => {
                            Combinatorics.bigCombination(campList,4-e.locked.length-cartesianLocked.length).forEach(teamComb => {
                                //Progress Bar
                                currIndex++
                                if (lastProgress !== Math.round(currIndex * 100 / tot))
                                    lastProgress = Math.round(currIndex * 100 / tot),
                                    postMessage({"status": Math.round(currIndex * 100 / tot) });

                                var teamComb = teamComb;
                                if (e.cartesianLock.length + e.locked.length>3) teamComb = []; // Se locked = 4 allora team deve riportare array vuota
                                var team = [].concat(teamComb, cartesianLocked, e.locked);
                                let elementoFiltro = e.preferenzeRisultati.lockedMatter === true ? team : teamComb; // applica filtro solo ai eroi non lockati
                                if (checkScDupe(team))
                                    return;

                                if (!e.locked.every(i => team.includes(i)))
                                    return;

                                if (e.classe.length > 0 && !checkHeroClass(elementoFiltro, HeroDB))
                                    return;

                                /*if (e.classe.length > 0 && !e.classe.every(i => elementoFiltro.map(function (hero, i) { return HeroDB[hero].role }).flat().includes(i))) 
                                    return;*/

                                if (e.elemento.length > 0 && !e.elemento.every(i => elementoFiltro.map(function (hero, i) { return HeroDB[hero].attribute }).flat().includes(i)))
                                    return;

                                if (e.buffs.length > 0 && !e.buffs.every(i => elementoFiltro.map(function (hero, i) { return HeroDB[hero].buffs }).flat().includes(i)))
                                    return;

                                if (e.debuffs.length > 0 && !e.debuffs.every(i => elementoFiltro.map(function (hero, i) { return HeroDB[hero].debuffs }).flat().includes(i)))
                                    return;

                                if (e.noS1debuffs && elementoFiltro.map(function (hero, i) { return HeroDB[hero].skills[0].debuff }).flat().filter(function (team) {return team != 20 && team != 25 && team != 21 && team != 24}).length != 0)
                                    return;

                                if (e.noDebuffs && elementoFiltro.map(function (hero, i) { return HeroDB[hero].debuffs }).flat().filter(function (team) {return team != 20 && team != 25 && team != 21 && team != 24}).length != 0)
                                    return;

                                if (e.AoE && !AoEHeroes.some(i => elementoFiltro.includes(i)) )
                                    return;

                                if (e.mustIncludeDispel && !dispelHeroes.some(i => elementoFiltro.includes(i)))
                                    return;

                                let risultatoDiQuestoTeam = nuovoCampSimulatorTeam2(team);
                              
                                if (e.preferenzeRisultati.advMuteLocked && ([].concat(cartesianLocked, e.locked).includes(risultatoDiQuestoTeam.migliorPG1) || [].concat(cartesianLocked, e.locked).includes(risultatoDiQuestoTeam.migliorPG2)) )
                                    return;

                                if (e.risultati[e.risultati.length-1].morale >= risultatoDiQuestoTeam.morale || (e.preferenzeRisultati.minMorale === true && e.preferenzeRisultati.morale > risultatoDiQuestoTeam.morale) )
                                    return;

                                for (var i = 0; i<e.risultati.length;i++) {
                                    if (risultatoDiQuestoTeam.morale >= e.risultati[i].morale) {
                                        e.risultati.splice(i, 0, risultatoDiQuestoTeam );
                                        e.risultati.splice(e.preferenzeRisultati.n, 1);
                                        break;
                                    };
                                };
                            });
                            if (e.risultati[e.risultati.length-1].team.length<3)
                                for (var i = 0; i < e.risultati.length; i++) {
                                    if (e.risultati[i].team.length<3) { // remove placeholders
                                        e.risultati.splice(i);
                                        break;
                                    };
                                };
                        });
                    };
                };
                //e.risultati.sort(function (a,b) {return ((a.morale > b.morale) ? -1 : ((a.morale == b.morale) ? 0: 1))}); // riordina l'ultimo elemento aggiunto
                postMessage({risultati: e.risultati});
}