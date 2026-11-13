import {appStore} from './storage';
import {exportLists,importLists,materialize,validateLists,type ImportPreview,type WordList,type Entry} from './library';
import {PracticeSession,itemsFromLists,type SessionOptions,type PracticeItem,type ListSummary} from './session';
import {TextSpeaker,browserSpeechBackend} from './text-speaker';

const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const node=(tag:string,text:string,className='')=>{const e=document.createElement(tag);e.textContent=text;e.className=className;return e;};
function button(text:string,run:()=>void,className='secondary'){const b=document.createElement('button');b.type='button';b.textContent=text;b.className=className;b.addEventListener('click',run);return b;}
export function download(name:string,text:string,type='application/json'){
  const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
interface Bridge {modeChanged(active:boolean):void;getVolume():number;setVolume(v:number):void}
export function setupPractice(bridge:Bridge){
  const host=el('practice-app');
  host.innerHTML=`<header class="practice-intro"><span class="eyebrow">LES MOTS DE TA SEMAINE</span><h1>Un mot après l’autre.</h1><p>Écouter, essayer, apprendre. Tes listes restent sur cet appareil.</p></header>
  <p id="practice-storage" class="storage-banner" role="status"></p>
  <div class="practice-layout"><aside class="library-panel"><div class="panel-heading"><h2>Mes listes</h2><button id="new-list" class="secondary">＋ Nouvelle liste</button></div><div id="list-cards"></div>
  <div class="library-tools"><label class="secondary file-pick">Importer CSV / JSON<input id="list-import" type="file" accept=".csv,.json,text/csv,application/json"></label><button id="export-all" class="text-button">Exporter mes listes</button></div>
  <details class="list-help"><summary>Modèles et sauvegarde</summary><p><a id="csv-template" download>Modèle CSV</a> · <a id="json-template" download>Modèle JSON</a></p><p>Une expression complète par entrée, avec ses accents. Une phrase de contexte est utile pour les homophones. L’import ajoute des copies ; il ne remplace pas tes listes.</p><p>Exporte tes listes pour les sauvegarder ou les transférer. Le navigateur peut effacer les données locales.</p></details></aside>
  <div class="practice-workspace"><section class="session-settings"><h2>Préparer une révision</h2><div class="settings-grid"><label>Exercice<select id="practice-mode"><option value="training">Entraînement · aide et correction</option><option value="exam">Dictée blanche · correction à la fin</option></select></label><label>Réponse<select id="practice-medium"><option value="keyboard">Dans la page</option><option value="paper">Sur papier</option></select></label><label>Voix française<select id="practice-voice"></select></label><label>Volume<input id="practice-volume" type="range" min="0" max="100" value="70"></label></div><p id="practice-voice-note" class="small-note"></p><label class="check-label"><input id="practice-shuffle" type="checkbox" checked> Mélanger les mots</label><div class="start-row"><button id="practice-start" class="primary">Commencer la révision ↗</button><button id="practice-preview" class="secondary">Écouter la voix</button></div><p id="practice-notice" role="status" aria-live="polite"></p></section>
  <section id="practice-session" class="session-panel" hidden><div class="session-toolbar"><span id="practice-progress"></span><div><button id="view-study" class="view-button" aria-pressed="true">Espace révision</button><button id="view-toy" class="view-button" aria-pressed="false">Sur le jouet</button><button id="practice-fullscreen" class="view-button" aria-pressed="false" aria-label="Plein écran de révision">⛶</button></div></div>
  <div id="study-stage"><div class="listening-mark" aria-hidden="true">♪</div><h2 id="study-prompt">Écoute, puis écris.</h2><div id="study-answer-slot"></div></div>
  <div id="practice-toy-stage" hidden></div>
  <form id="practice-answer-form"><div id="practice-answer-wrap"><label for="practice-answer">Ta réponse complète</label><input id="practice-answer" form="practice-answer-form" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"><div id="accent-palette" class="accent-palette"></div></div><div class="answer-actions"><button id="practice-submit" class="primary" type="submit">Essaie · Valider</button><button id="practice-repeat" class="secondary" type="button">Répéter</button><button id="practice-help" class="text-button" type="button">Voir la réponse</button><button id="practice-pause" class="text-button" type="button">Pause</button></div></form>
  <p id="practice-feedback" class="practice-feedback" role="status" aria-live="polite"></p><div id="paper-mark" hidden></div><button id="practice-next" class="primary" hidden>Mot suivant →</button><section id="practice-results" hidden></section></section></div></div>
  <dialog id="list-editor"><form id="list-editor-form"><div class="panel-heading"><h2 id="editor-heading">Nouvelle liste</h2><button type="button" id="editor-close" class="text-button">Fermer</button></div><label>Nom de la liste<input id="list-title" required maxlength="120" placeholder="Ex. Semaine 10"></label><details open><summary>Ajouter plusieurs expressions</summary><label for="quick-words">Une expression par ligne</label><textarea id="quick-words" rows="4" placeholder="une étoile&#10;la maison&#10;ses"></textarea><button type="button" id="append-words" class="secondary">Ajouter ces expressions</button></details><p class="small-note">Le contexte sera lu après l’expression. Il n’est pas à recopier dans la réponse.</p><div id="entry-editor"></div><button type="button" id="append-entry" class="text-button">＋ Ajouter une entrée</button><p id="editor-error" class="error" role="alert"></p><button type="submit" class="primary">Enregistrer la liste</button></form></dialog>
  <dialog id="import-dialog"><h2>Vérifier avant d’ajouter</h2><div id="import-content"></div><div class="dialog-actions"><button id="confirm-import" class="primary">Ajouter les listes</button><button id="cancel-import" class="secondary">Annuler</button></div></dialog>`;
  el<HTMLAnchorElement>('csv-template').href=new URL('templates/modele-listes.csv',document.baseURI).href;
  el<HTMLAnchorElement>('json-template').href=new URL('templates/modele-listes.json',document.baseURI).href;
  const speaker=new TextSpeaker(browserSpeechBackend()),selected=new Set<string>();
  const toy=el('toy'),originalHome=toy.parentElement!,toyHome=el('practice-toy-stage');
  const overlay=document.createElement('div');overlay.id='practice-toy-overlay';overlay.hidden=true;toy.querySelector('.fascia')!.after(overlay);
  const answer=el<HTMLInputElement>('practice-answer'),answerWrap=el('practice-answer-wrap');el('study-answer-slot').append(answerWrap);
  let active=false,view:'study'|'toy'='study',lists:WordList[]=[],summaries:ListSummary[]=[],session:PracticeSession|undefined,paused=false,feedback='',voices:SpeechSynthesisVoice[]=[],preferredVoice='',editingId:string|undefined,preview:ImportPreview|undefined,editorDirty=false;
  const notice=(text:string)=>{el('practice-notice').textContent=text;};
  const storageNote=()=>{el('practice-storage').textContent=appStore.durable?'Listes enregistrées dans ce navigateur · Export JSON disponible.':'Stockage indisponible : tes listes restent utilisables pendant cette session. Exporte-les avant de fermer la page.';};
  const currentVoice=()=>voices.find(v=>v.voiceURI===el<HTMLSelectElement>('practice-voice').value);
  function say(text:string){const voice=currentVoice();if(!voice){notice('Aucune voix française disponible. Active une voix française dans ton navigateur.');return;}speaker.speak(text,voice,bridge.getVolume(),error=>{if(error)notice('La voix n’a pas répondu. Réessaie avec Répéter ou choisis une autre voix.');});}
  function announce(){if(!session||session.finished||paused||!active)return;speaker.cancel();const item=session.current;say(item.text+(item.context?'. '+item.context:'.'));}
  function refreshVoices(){
    const select=el<HTMLSelectElement>('practice-voice'),previous=select.value||preferredVoice;
    const rank=(v:SpeechSynthesisVoice)=>v.localService?(/^fr[-_]CA$/i.test(v.lang)?0:/^fr[-_]FR$/i.test(v.lang)?1:2):3;
    voices=(window.speechSynthesis?.getVoices()||[]).filter(v=>/^fr(?:[-_]|$)/i.test(v.lang)).sort((a,b)=>rank(a)-rank(b)||a.name.localeCompare(b.name,'fr'));
    select.replaceChildren(...voices.map(v=>new Option(v.name+(v.localService?' · sur cet appareil':' · en ligne'),v.voiceURI)));
    if(voices.some(v=>v.voiceURI===previous))select.value=previous;
    el<HTMLButtonElement>('practice-start').disabled=!voices.length;el<HTMLButtonElement>('practice-preview').disabled=!voices.length;
    el('practice-voice-note').textContent=!voices.length?'Aucune voix française disponible dans ce navigateur.':currentVoice()?.localService?'Voix du système, sans clé API.':'Cette voix du navigateur utilise Internet.';
  }
  window.speechSynthesis?.addEventListener('voiceschanged',refreshVoices);
  function rememberVoice(){speaker.cancel();preferredVoice=el<HTMLSelectElement>('practice-voice').value;void appStore.put('prefs','practiceVoice',preferredVoice).then(storageNote);refreshVoices();}
  el('practice-voice').addEventListener('change',()=>{rememberVoice();const original=el<HTMLSelectElement>('voice');if(Array.from(original.options).some(o=>o.value===preferredVoice)){original.value=preferredVoice;original.dispatchEvent(new Event('change'));}});
  el('voice').addEventListener('change',()=>{const value=el<HTMLSelectElement>('voice').value;if(voices.some(v=>v.voiceURI===value)){el<HTMLSelectElement>('practice-voice').value=value;rememberVoice();}});
  el('practice-preview').addEventListener('click',()=>say('Bonjour ! Nous allons réviser les mots de ta semaine.'));
  el<HTMLInputElement>('practice-volume').value=String(bridge.getVolume()*100);
  el('practice-volume').addEventListener('input',()=>bridge.setVolume(Number(el<HTMLInputElement>('practice-volume').value)/100));
  function renderLists(){
    const cards=el('list-cards');cards.replaceChildren();
    if(!lists.length){const empty=node('div','','library-empty');empty.append(node('h3','Tes mots, ta semaine.'),node('p','Crée ta première liste ou importe un fichier CSV ou JSON.'),button('Essayer une liste exemple',()=>void addContents([{title:'Pour commencer',entries:[{text:'une étoile'},{text:'la maison'},{text:'ses',context:'Il range ses jouets.'}]}])));cards.append(empty);}
    for(const list of lists){
      const card=node('article','','list-card'),label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=selected.has(list.id);check.setAttribute('aria-label','Réviser '+list.title);check.addEventListener('change',()=>{if(check.checked)selected.add(list.id);else selected.delete(list.id);});
      label.append(check,node('strong',list.title));card.append(label,node('p',`${list.entries.length} expression${list.entries.length>1?'s':''}`));
      const summary=summaries.find(s=>s.id===list.id);if(summary)card.append(node('p',`Dernière révision : ${summary.first}/${summary.total} au premier essai · ${summary.review} à revoir${summary.paper?' · auto-évaluation papier':''}`,'small-note'));
      const actions=node('div','','list-actions');actions.append(button('Modifier',()=>edit(list)),button('Dupliquer',()=>void addContents([{title:list.title+' (copie)',entries:list.entries}])),button('Exporter',()=>download('liste.json',exportLists([list]))),button('Supprimer',()=>void removeList(list),'text-button'));card.append(actions);cards.append(card);
    }
    el<HTMLButtonElement>('export-all').disabled=!lists.length;storageNote();
  }
  async function addContents(contents:ImportPreview['lists']){const added=materialize(contents);await appStore.putMany('lists',added.map(v=>[v.id,v]));lists.push(...added);added.forEach(l=>selected.add(l.id));renderLists();notice(`${added.length} liste${added.length>1?'s':''} ajoutée${added.length>1?'s':''}.`);}
  async function removeList(list:WordList){if(!confirm(`Supprimer la liste « ${list.title} » ?`))return;try{await appStore.removeSessionOrStored('lists',list.id);await appStore.removeSessionOrStored('results',list.id);lists=lists.filter(l=>l.id!==list.id);summaries=summaries.filter(s=>s.id!==list.id);selected.delete(list.id);renderLists();}catch{notice('La suppression n’a pas pu être enregistrée. Réessaie.');}}
  function addEntry(entry:Entry={text:''}){
    const row=node('div','','entry-row'),text=document.createElement('input'),context=document.createElement('input');text.value=entry.text;text.maxLength=240;text.placeholder='Expression à écrire';text.setAttribute('aria-label','Expression à écrire');text.className='entry-text';context.value=entry.context||'';context.maxLength=500;context.placeholder='Phrase de contexte (facultatif)';context.setAttribute('aria-label','Phrase de contexte');context.className='entry-context';row.append(text,context,button('Retirer',()=>{row.remove();editorDirty=true;},'text-button'));el('entry-editor').append(row);
  }
  function edit(list?:WordList){editingId=list?.id;el('editor-heading').textContent=list?'Modifier la liste':'Nouvelle liste';el<HTMLInputElement>('list-title').value=list?.title||'';el<HTMLTextAreaElement>('quick-words').value='';el('entry-editor').replaceChildren();for(const entry of list?.entries||[])addEntry(entry);el('editor-error').textContent='';editorDirty=false;el<HTMLDialogElement>('list-editor').showModal();el('list-title').focus();}
  function closeEditor(){if(editorDirty&&!confirm('Fermer sans enregistrer les modifications ?'))return;el<HTMLDialogElement>('list-editor').close();}
  el('new-list').addEventListener('click',()=>edit());el('editor-close').addEventListener('click',closeEditor);
  el('list-editor').addEventListener('cancel',e=>{e.preventDefault();closeEditor();});el('list-editor').addEventListener('input',()=>{editorDirty=true;});
  el('append-entry').addEventListener('click',()=>{addEntry();editorDirty=true;});
  function appendQuick(){const text=el<HTMLTextAreaElement>('quick-words');for(const line of text.value.split(/\r?\n/).map(v=>v.trim()).filter(Boolean))addEntry({text:line});text.value='';editorDirty=true;}
  el('append-words').addEventListener('click',appendQuick);
  el('list-editor-form').addEventListener('submit',e=>{e.preventDefault();void(async()=>{
    try{
      if(el<HTMLTextAreaElement>('quick-words').value.trim())appendQuick();
      const entries=Array.from(el('entry-editor').querySelectorAll('.entry-row')).map(row=>({text:row.querySelector<HTMLInputElement>('.entry-text')!.value,context:row.querySelector<HTMLInputElement>('.entry-context')!.value}));
      const checked=validateLists({version:1,lists:[{title:el<HTMLInputElement>('list-title').value,entries}]});
      if(editingId){const updated={...checked.lists[0],id:editingId,updatedAt:new Date().toISOString()};await appStore.put('lists',editingId,updated);lists=lists.map(l=>l.id===editingId?updated:l);await appStore.removeSessionOrStored('results',editingId);summaries=summaries.filter(s=>s.id!==editingId);renderLists();}
      else await addContents(checked.lists);
      el<HTMLDialogElement>('list-editor').close();editorDirty=false;notice(checked.warnings.join(' ')||'Liste enregistrée.');
    }catch(error){el('editor-error').textContent=(error as Error).message;}
  })();});
  el('export-all').addEventListener('click',()=>download('mes-listes.json',exportLists(lists)));
  el('list-import').addEventListener('change',()=>void(async()=>{
    const input=el<HTMLInputElement>('list-import'),file=input.files?.[0];if(!file)return;
    try{
      if(file.size>2097152)throw new Error('Fichier trop volumineux : maximum 2 Mo.');
      const ext=file.name.split('.').at(-1)?.toLowerCase();if(ext!=='csv'&&ext!=='json')throw new Error('Choisis un fichier .csv ou .json.');
      preview=importLists(await file.text(),ext);const content=el('import-content');content.replaceChildren();
      for(const list of preview.lists){content.append(node('h3',`${list.title} · ${list.entries.length} entrées`));const ul=document.createElement('ul');for(const entry of list.entries.slice(0,10))ul.append(node('li',entry.text+(entry.context?' — '+entry.context:'')));content.append(ul);if(list.entries.length>10){const details=document.createElement('details');details.append(node('summary',`Voir les ${list.entries.length-10} autres entrées`));details.addEventListener('toggle',()=>{if(!details.open||details.querySelector('ul'))return;const rest=document.createElement('ul');for(const e of list.entries.slice(10))rest.append(node('li',e.text+(e.context?' — '+e.context:'')));details.append(rest);});content.append(details);}}
      const repeated=preview.lists.filter(l=>lists.some(existing=>existing.title===l.title));if(repeated.length)content.append(node('p','Ces titres existent déjà : '+repeated.map(l=>l.title).join(', ')+'. De nouvelles copies seront ajoutées.','import-warning'));
      if(preview.warnings.length)content.append(node('p',preview.warnings.join(' '),'import-warning'));
      el<HTMLDialogElement>('import-dialog').showModal();
    }catch(error){notice((error as Error).message);}finally{input.value='';}
  })());
  el('cancel-import').addEventListener('click',()=>{preview=undefined;el<HTMLDialogElement>('import-dialog').close();});
  el('confirm-import').addEventListener('click',()=>void(async()=>{if(!preview)return;el<HTMLButtonElement>('confirm-import').disabled=true;try{await addContents(preview.lists);preview=undefined;el<HTMLDialogElement>('import-dialog').close();}finally{el<HTMLButtonElement>('confirm-import').disabled=false;}})());
  function settings():SessionOptions{return{mode:el<HTMLSelectElement>('practice-mode').value as 'training'|'exam',medium:el<HTMLSelectElement>('practice-medium').value as 'keyboard'|'paper',shuffle:el<HTMLInputElement>('practice-shuffle').checked};}
  function startSession(items?:PracticeItem[]){
    if(!currentVoice()){notice('Choisis une voix française pour commencer.');return;}
    const source=items||itemsFromLists(lists.filter(l=>selected.has(l.id)));
    if(!source.length){notice('Choisis au moins une liste à réviser.');return;}
    if(session&&!session.finished&&!confirm('Commencer une nouvelle séance ? La séance en cours sera remplacée.'))return;
    session=new PracticeSession(source,settings());paused=false;feedback='Écoute l’expression, puis écris-la.';answer.value='';speaker.cancel();renderSession();announce();el('practice-session').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function submit(){
    if(!session||paused||session.finished)return;
    if(session.phase==='correction'){next();return;}
    if(session.phase!=='question')return;
    if(session.options.medium==='keyboard'&&!answer.value.trim()){feedback='Écris ta réponse avant de valider.';renderSession();return;}
    speaker.cancel();const event=session.submit(answer.value);
    if(event==='retry'){feedback='Ce n’est pas encore la bonne écriture. Essaie une deuxième fois.';say('Essaie encore.');}
    else if(event==='corrected'){const r=session.results.at(-1)!;feedback=(r.outcome==='review'?'La bonne réponse est : ':'Bien joué ! Cela s’écrit : ')+r.item.text;say(r.outcome==='review'?'La bonne réponse est : '+r.item.text:'Bien joué !');}
    else if(event==='paper-mark'){feedback='La correction est : '+session.current.text;say(session.current.text);}
    else{answer.value='';feedback='Réponse enregistrée.';if(!session.finished)announce();}
    renderSession();
  }
  function next(){if(!session||paused)return;speaker.cancel();session.next();answer.value='';feedback='Écoute la prochaine expression.';renderSession();announce();}
  function help(){if(!session||paused||session.phase!=='question'||session.options.mode!=='training')return;speaker.cancel();session.help();const r=session.results.at(-1);if(r){feedback='Cela s’écrit : '+r.item.text+' · À revoir.';say(r.item.text);}renderSession();}
  function togglePause(){if(!session||session.finished)return;paused=!paused;speaker.cancel();feedback=paused?'Séance en pause.':'On reprend.';renderSession();if(!paused)announce();}
  function markPaper(correct:boolean,index?:number){session?.markPaper(correct,index);feedback='Auto-évaluation enregistrée.';renderSession();}
  function renderResults(){
    if(!session?.finished)return;const results=el('practice-results');results.replaceChildren();const counts={first:0,retry:0,review:0,pending:0};for(const r of session.results)counts[r.outcome]++;
    results.append(node('h2','Ta révision est terminée.'),node('p',`${counts.first} au premier essai · ${counts.retry} après nouvel essai · ${counts.review} à revoir${counts.pending?' · '+counts.pending+' à évaluer':''}`));
    if(session.options.medium==='paper')results.append(node('p','Bilan sur papier : indique les mots réussis et ceux à revoir.','small-note'));
    const table=document.createElement('table'),head=document.createElement('thead'),hr=document.createElement('tr');['Expression attendue','Ta réponse','Bilan'].forEach(t=>hr.append(node('th',t)));head.append(hr);table.append(head);const body=document.createElement('tbody');
    session.results.forEach((r,i)=>{const tr=document.createElement('tr');tr.append(node('td',r.item.text),node('td',session!.options.medium==='paper'?'Sur papier':r.answer||'Aide demandée'));const td=document.createElement('td');if(session!.options.medium==='paper'){td.append(button('Réussi · '+r.item.text,()=>markPaper(true,i)),button('À revoir · '+r.item.text,()=>markPaper(false,i)),node('span',r.outcome==='pending'?' À évaluer':r.outcome==='first'?' Réussi':' À revoir'));}else td.textContent=r.outcome==='first'?'Au premier essai':r.outcome==='retry'?'Après nouvel essai':'À revoir';tr.append(td);body.append(tr);});
    table.append(body);const wrap=node('div','','result-table');wrap.append(table);results.append(wrap);
    const review=button('Refaire les mots à revoir',()=>{const items=session!.reviewItems;session=undefined;startSession(items);},'primary');review.disabled=session.pending||!session.reviewItems.length;results.append(review);
    for(const summary of session.summaries()){void appStore.put('results',summary.id,summary).then(()=>{summaries=summaries.filter(s=>s.id!==summary.id).concat(summary);renderLists();});}
  }
  function renderSession(){
    const panel=el('practice-session');panel.hidden=!session;if(!session)return;
    const phase=session.phase,question=phase==='question'&&!paused;
    el('practice-progress').textContent=session.finished?'Bilan':`Expression ${session.index+1} / ${session.items.length}`;
    el('study-prompt').textContent=paused?'On fait une pause.':session.finished?'Bravo pour cette révision.':session.options.medium==='paper'?'Écoute, puis écris sur papier.':'Écoute, puis écris.';
    el('practice-feedback').textContent=feedback;
    answerWrap.hidden=session.options.medium==='paper'||session.finished;answer.disabled=!question;
    el('practice-answer-form').hidden=session.finished;
    el<HTMLButtonElement>('practice-submit').disabled=!question;el('practice-submit').textContent=session.options.medium==='paper'?'J’ai écrit':session.options.mode==='exam'?'Enregistrer et continuer':'Essaie · Valider';
    el<HTMLButtonElement>('practice-repeat').disabled=paused||session.finished;
    el<HTMLButtonElement>('practice-help').hidden=session.options.mode!=='training';el<HTMLButtonElement>('practice-help').disabled=!question;
    el('practice-pause').textContent=paused?'Reprendre':'Pause';
    el('practice-next').hidden=phase!=='correction'||paused;
    const mark=el('paper-mark');mark.hidden=phase!=='paper-mark'||paused;mark.replaceChildren(button('Réussi',()=>markPaper(true)),button('À revoir',()=>markPaper(false)));
    el('practice-results').hidden=!session.finished;renderResults();
    toy.querySelector('.display')!.setAttribute('data-practice',session.finished?'BRAVO':paused?'PAUSE':`${session.index+1} / ${session.items.length}`);
    refreshToyButtons();
  }
  function refreshToyButtons(){if(!active)return;for(const b of Array.from(toy.querySelectorAll<HTMLButtonElement>('.toy-key'))){const row=Number(b.dataset.row),mask=Number(b.dataset.mask);const allowed=row<=4||(row===5&&[1,2,8,16].includes(mask))||(row===7&&[1,2,4,8,16].includes(mask))||(row===8&&mask===16);b.disabled=!allowed;b.title=allowed?b.getAttribute('aria-label')!:'Fonction disponible dans le mode original.';}}
  function switchView(nextView:'study'|'toy'){
    view=nextView;speaker.cancel();const toyView=view==='toy';toyHome.hidden=!toyView;el('study-stage').hidden=toyView;overlay.hidden=!toyView;
    if(toyView){toyHome.append(toy);overlay.append(answerWrap);}else{originalHome.prepend(toy);el('study-answer-slot').append(answerWrap);}
    el('view-study').setAttribute('aria-pressed',String(!toyView));el('view-toy').setAttribute('aria-pressed',String(toyView));
    document.body.classList.toggle('practice-toy',active&&toyView);void appStore.put('prefs','practiceView',view);renderSession();if(session?.phase==='question'&&!paused)announce();
  }
  async function fullscreen(){const activeFs=document.body.classList.contains('practice-fullscreen');if(activeFs){document.body.classList.remove('practice-fullscreen');if(document.fullscreenElement===host)await document.exitFullscreen().catch(()=>{});}else{document.body.classList.add('practice-fullscreen');try{await host.requestFullscreen?.();}catch{}}el('practice-fullscreen').setAttribute('aria-pressed',String(!activeFs));}
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){document.body.classList.remove('practice-fullscreen');el('practice-fullscreen').setAttribute('aria-pressed','false');}});
  function insert(text:string){if(!session||paused||session.phase!=='question'||session.options.medium!=='keyboard')return;answer.setRangeText(text,answer.selectionStart??answer.value.length,answer.selectionEnd??answer.value.length,'end');answer.dispatchEvent(new Event('input',{bubbles:true}));}
  for(const char of ['é','è','ê','ë','à','â','î','ï','ô','ù','û','ü','ç',"'",'-',' '])el('accent-palette').append(button(char===' '?'Espace':char,()=>insert(char),'accent-key'));
  function toyKey(key:string){
    if(!active)return;
    if(key==='9'||key==='1'){if(!session||session.finished)startSession();else if(paused)togglePause();else if(session.phase==='correction')next();else if(key==='1')announce();return;}
    if(key==='2'){startSession();return;}if(key==='3'){announce();return;}if(key==='4'){help();return;}if(key==='F2'){if(!paused)togglePause();return;}if(key==='Enter'){submit();return;}
    if(key==='Backspace'){if(!answer.disabled){const a=answer.selectionStart??answer.value.length,b=answer.selectionEnd??a;answer.setRangeText('',a===b?Math.max(0,a-1):a,b,'end');}return;}
    if(key.length===1)insert(key);
  }
  el('practice-start').addEventListener('click',()=>startSession());el('practice-answer-form').addEventListener('submit',e=>{e.preventDefault();submit();});el('practice-repeat').addEventListener('click',announce);el('practice-help').addEventListener('click',help);el('practice-next').addEventListener('click',next);el('practice-pause').addEventListener('click',togglePause);
  el('view-study').addEventListener('click',()=>switchView('study'));el('view-toy').addEventListener('click',()=>switchView('toy'));el('practice-fullscreen').addEventListener('click',()=>void fullscreen());
  function setActive(value:boolean){
    if(!value&&editorDirty&&!confirm('Quitter sans enregistrer les modifications de la liste ?'))return;
    active=value;speaker.cancel();bridge.modeChanged(value);document.body.classList.toggle('practice-active',value);host.hidden=!value;el('toy-app').hidden=value;
    el('mode-practice').setAttribute('aria-selected',String(value));el('mode-toy').setAttribute('aria-selected',String(!value));
    if(value){el<HTMLInputElement>('practice-volume').value=String(Math.round(bridge.getVolume()*100));switchView(view);refreshToyButtons();}
    else{originalHome.prepend(toy);overlay.hidden=true;document.body.classList.remove('practice-toy','practice-fullscreen');if(session&&!session.finished){paused=true;feedback='Séance en pause.';renderSession();}}
    void appStore.put('prefs','activeMode',value?'practice':'toy');
  }
  el('mode-practice').addEventListener('click',()=>setActive(true));el('mode-toy').addEventListener('click',()=>setActive(false));
  window.addEventListener('beforeunload',e=>{speaker.cancel();if(editorDirty){e.preventDefault();e.returnValue='';}});
  void(async()=>{lists=(await appStore.all<WordList>('lists')).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)||a.title.localeCompare(b.title,'fr',{numeric:true}));summaries=await appStore.all<ListSummary>('results');preferredVoice=await appStore.get<string>('prefs','practiceVoice')||'';view=await appStore.get<'study'|'toy'>('prefs','practiceView')||'study';if(lists[0])selected.add(lists[0].id);renderLists();refreshVoices();if(await appStore.get('prefs','activeMode')==='practice')setActive(true);})();
  return{get active(){return active;},toyKey,refreshToyButtons,submit,handleKeyboard(e:KeyboardEvent){
    const target=e.target as HTMLElement;
    if(e.key==='Escape'&&document.body.classList.contains('practice-fullscreen')){void fullscreen();return true;}
    if(target===answer&&e.key==='Enter'){submit();return true;}
    if(target.matches('input,textarea,select')||e.ctrlKey||e.altKey||e.metaKey)return false;
    if(view==='toy'&&target.closest('#toy')){
      if(['Backspace','F2','F1'].includes(e.key)||/^[0-9]$/.test(e.key)){toyKey(e.key==='F1'?'9':e.key);return true;}
      if(e.key==='Enter'&&!target.closest('button')){submit();return true;}
      if(e.key.length===1&&!(e.key===' '&&target.closest('button'))){insert(e.key);return true;}
    }
    return false;
  }};
}
