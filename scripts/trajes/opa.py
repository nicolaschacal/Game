# Traje «Opa» de Nilo (premio de la postal secreta). Se arma recoloreando la skin base y sumando piezas (alitas, cierre, M bordada, avioncito). Correr una sola vez: agrega EDATA.nilo.s.opa a elenco.js.
import sys,re,json; sys.path.insert(0,__import__('os').path.dirname(__file__)); from edata import *
# ── paleta «Opa» (aviador de 1961) ──
JACK = {'#34468a':'#5e3920','#3E5BA9':'#7A4A2B','#3a539c':'#704428','#516aad':'#8a5835','#3a519a':'#6f4327','#374c92':'#5a2e22','#36498e':'#4e301c','#3c57a3':'#74472a','#5970af':'#8f5d3a','#384d94':'#5a2e22','#7888b5':'#7d3a2c'}
PANTS= {'#261f40':'#3f4224','#2B2440':'#55593a','#443d52':'#666b48'}
BOOT = {'#7c4c31':'#2f2018','#825235':'#3d2a1f','#8A5A3B':'#46301f','#E9C08A':'#8a6a52','#be9368':'#6b5040','#9E6B3C':'#5a4030'}
SCARF= {'#E8452C':'#F6F1E6','#bd3d26':'#cfc6b4','#d14129':'#e8e1d2','#c33e27':'#ddd4c2','#d44129':'#e9e2d4','#cc4028':'#e3dccd','#aa3923':'#c4bba9'}
COLLAR={'#E8452C':'#E6CE9E','#bd3d26':'#b99f72','#da422a':'#d9bf8e','#dd432a':'#d9bf8e','#bf4932':'#c4a978','#ea563d':'#F2E0B6','#cc4028':'#d9bf8e','#aa3923':'#b0966a'}
HARN = {'#C98F55':'#B8A577','#a87143':'#8f7f55','#b9814c':'#a89466','#F2B937':'#D5D8DC','#c18b2d':'#9aa0a8','#c48e2e':'#9aa0a8'}
PACK = {'#C98F55':'#9C8E5E','#a87143':'#7d7148','#bc834e':'#8d8053','#c58b53':'#a39463','#d19d67':'#b3a472','#a56f41':'#7d7148','#F2B937':'#D5D8DC','#c18b2d':'#9aa0a8','#ae7929':'#8a9098'}
ROLL = {'#3A8A30':'#5d6b7c','#5DB84F':'#8796a8','#5c8d3f':'#6f7d8e'}
HELM = {'#91613d':'#6e4128','#A9794D':'#8A5634','#9e6e46':'#7d4c2e','#9f6f46':'#7d4c2e','#b78c62':'#9c6a45','#996942':'#784a2d'}
P = {}
for k in ['coat','up0','fo0','up1','fo1','pkL','pkR','placket','hem','cuff0','cuff1']: P['ni_'+k]=JACK
for k in ['legL','legR','rleg0','rleg1']: P['ni_'+k]=PANTS
for k in ['bootL','bootR','bootLs','bootRs','rbt0','rbt1','rbs0','rbs1','rsb0','rsb1','rsl0','rsl1']: P['ni_'+k]=BOOT
for k in ['tail1','tail2','endF','endSt','rtb1','rtb2']: P['ni_'+k]=SCARF
for k in ['wrapF','wrapB','pl1','pl2','rwrap']: P['ni_'+k]=COLLAR
for k in ['strapL','strapR','bkL','bkR','btn67','btn75']: P['ni_'+k]=HARN
for k in ['pack','pkf','pkb','ps1','ps2','rs1','rs2']: P['ni_'+k]=PACK
P['ni_roll']=ROLL
for k in ['Q0dome','Q0flL','Q0flR','Q0rd']: P['ni_'+k]=HELM
def piece(tag):
  h=re.search(r"href='#([^']+)'",tag) or re.search(r"clip-path='url\(#([^']+)c\)'",tag)
  return h.group(1) if h else None
def recolor(svg, side):
  out=[]
  for tk in tok(svg):
    pc=piece(tk)
    mp=P.get(pc)
    if side=='back' and pc=='ni_pl2': mp=COLLAR
    if mp:
      tk=re.sub(r"fill='(#[0-9A-Fa-f]{6})'",lambda m_: "fill='%s'"%mp.get(m_.group(1),mp.get(m_.group(1).upper(),m_.group(1))),tk)
    out.append(tk)
  return ''.join(out)
# ── piezas nuevas ──
WINGS = ("<g transform='translate(66.2 70.6)'>"
  "<path d='M-.9 0 Q-2.6 -1.6 -6 -1.3 Q-4.6 -.6 -4.9 .1 Q-3.6 -.2 -3.4 .6 Q-2.2 .2 -.9 1.1Z' fill='#c99a3a'/>"
  "<path d='M.9 0 Q2.6 -1.6 6 -1.3 Q4.6 -.6 4.9 .1 Q3.6 -.2 3.4 .6 Q2.2 .2 .9 1.1Z' fill='#c99a3a'/>"
  "<path d='M-.9 -.4 Q-2.6 -1.9 -6 -1.7 Q-4.6 -1 -4.9 -.3 Q-3.6 -.6 -3.4 .2 Q-2.2 -.2 -.9 .7Z' fill='#F2C14E'/>"
  "<path d='M.9 -.4 Q2.6 -1.9 6 -1.7 Q4.6 -1 4.9 -.3 Q3.6 -.6 3.4 .2 Q2.2 -.2 .9 .7Z' fill='#F2C14E'/>"
  "<circle cx='0' cy='.1' r='1.45' fill='#c99a3a'/><circle cx='0' cy='-.2' r='1.2' fill='#F2C14E'/><circle cx='0' cy='-.2' r='.5' fill='#C8402A'/></g>")
ZIP = ("<path d='M60.1 63.5 L60.1 86' stroke='#2e1c10' stroke-width='.7' fill='none'/>"
  "<rect x='58.9' y='64.6' width='2.4' height='3.6' rx='.8' fill='#9aa0a8'/><rect x='59.3' y='64.8' width='1.6' height='2.9' rx='.6' fill='#D5D8DC'/>")
MSTITCH = "<path d='M-2.7 13.6 L-2.4 9.4 L0 11.9 L2.4 9.4 L2.7 13.6' fill='none' stroke='#C8402A' stroke-width='1.15' stroke-linejoin='round' stroke-linecap='round'/>"
# avioncito rojo pintado en la tapa de la mochila (vista de espaldas), centro aprox (60,62)
PLANE = ("<g transform='translate(60.2 72.4) rotate(-10) scale(1.15)'>"
  "<path d='M-5.2 -.4 Q-5.6 0 -5.2 .5 L4.4 .7 Q5.6 .2 4.4 -.5Z' fill='#C8402A'/>"
  "<path d='M-1.2 -.3 L-.2 -3.6 L1.4 -3.6 L1.1 -.3Z M-1.2 .5 L-.2 3.8 L1.4 3.8 L1.1 .5Z' fill='#C8402A'/>"
  "<path d='M-4.6 -.3 L-5.3 -2.1 L-4.3 -2.1 L-3.4 -.3Z' fill='#C8402A'/>"
  "<circle cx='4.9' cy='.1' r='.45' fill='#F6F1E6'/></g>")
def flat(g):
  m=re.match(r"<g transform='([^']+)'>(.*)</g>$",g,re.S); tr,body=m.group(1),m.group(2)
  return re.sub(r"<(path|circle) ",lambda x:"<%s transform='%s' "%(x.group(1),tr),body)
WINGS=flat(WINGS); PLANE=flat(PLANE)
def build():
  s,m,D=load()
  F=recolor(edec(D,'nilo','base','front'),'front')
  B=recolor(edec(D,'nilo','base','back'),'back')
  # front: quitar botones (cierre en su lugar), alitas y cierre al final del grupo hto coloreado
  F=re.sub(r"<use href='#ni_btn(67|75)'[^>]*/>","",F)
  i=F.rfind("<g data-j='hwb'"); j=F.rfind("</g>",0,i); F=F[:j]+ZIP+WINGS+F[j:]
  # M bordada en la punta de la bufanda (capa coloreada)
  i=F.rfind("<use href='#ni_endSt' fill="); k=F.find("/>",i)+2; F=F[:k]+MSTITCH+F[k:]
  B=re.sub(r"<use href='#ni_pkb'[^>]*/>",'',B)
  # back: avioncito sobre la tapa de la mochila
  for mm in list(re.finditer(r"<use href='#ni_pkf' fill='[^']+'/>",B))[::-1]:
    k=mm.end(); B=B[:k]+PLANE+B[k:]
  return s,m,D,F,B
if __name__=='__main__':
  s,m,D,F,B=build()
  base=D['nilo']['s']['base']
  D['nilo']['n']['opa']='Opa'
  D['nilo']['s']['opa']={'front':{'r':'base.front','o':enc(edec(D,'nilo','base','front'),F)},'back':{'r':'base.back','o':enc(edec(D,'nilo','base','back'),B)},'hy':base['hy']}
  if 'piv' in base: D['nilo']['s']['opa']['piv']=base['piv']
  out=s[:m.start(1)]+json.dumps(D,ensure_ascii=False,separators=(',',':'))+s[m.end(1):]
  open(SRC,'w').write(out); print('ok',len(out)-len(s))
