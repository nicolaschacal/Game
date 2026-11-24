# Mora: 1) arregla el sombrero de «Lluvia» (la copa era angosta y asomaba el pelo a los costados: se ensancha la copa)
#       2) traje de historia «Remitente» (postal secreta): tapado azul correo, bufanda verde aurora, sello postal cosido y un sobre de correo aéreo asomando del bolso.
import sys,os,re,json; sys.path.insert(0,os.path.dirname(__file__)); from edata import *
s,m,D=load(); MO=D['mora']['s']
old={(sk,k):edec(D,'mora',sk,k) for sk in MO for k in ['front','back']}
def widen(svg):
  def fix(mm):
    d=mm.group(1); nums=re.findall(r"-?\d*\.?\d+",d); out=[]; i=0
    def rep(x):
      nonlocal i; v=float(x.group(0)); r=(round(v*1.32,2) if i%2==0 else v); i+=1; return ('%g'%r).replace('0.','.',1) if 0<abs(r)<1 else '%g'%r
    return "<path id='mo_KM1sw' d='"+re.sub(r"-?\d*\.?\d+",rep,d)+"'"
  svg=re.sub(r"<path id='mo_KM1sw' d='([^']+)'",fix,svg)
  return svg.replace("<path d='M-20 2.6l40 0 0-1.2-40 0z'","<path d='M-30 2.6l60 0 0-1.2-60 0z'")
new={}
new[('lluvia','front')]=widen(old[('lluvia','front')]); new[('lluvia','back')]=widen(old[('lluvia','back')])
COAT={'#4E9A4A':'#B9844C','#508440':'#2a3f6c','#508b44':'#aa7944','#52783b':'#8c6036','#60a358':'#c8955c','#517d3d':'#946538','#4f8d44':'#a67543','#508a43':'#aa7944','#83b473':'#3e5891'}
BERET={'#C2463A':'#2F4677','#a33e30':'#243862','#b14235':'#2a3f6c','#c95b4c':'#3e5891','#94392b':'#1e2f52','#ad4033':'#26395f'}
BAG={'#9c6b33':'#8f2f27','#B8873F':'#B23A30','#ab7a3a':'#a2352c','#9a6933':'#8a2e26','#c19451':'#c4483c','#C2463A':'#F2C14E','#a33e30':'#c99a3a'}
SCARF={'#E8B425':'#3CC296','#bd8b21':'#2a9474','#d19e23':'#34ad86','#c39022':'#2f9e7b','#aa771f':'#25876a','#cc9822':'#34ad86','#daa624':'#37b78d','#dda924':'#37b78d','#d4a123':'#36b28a','#bf8f2d':'#2a9474','#eaba36':'#62d8af'}
P={}
for k in ['Mcoat','Mhem','Mpkt','up0','fo0','up1','fo1','cuff0','cuff1']: P['mo_'+k]=COAT
for k in ['Mber','Mbst']: P['mo_'+k]=BERET
for k in ['Mbag','Mbgf','Mbgb']: P['mo_'+k]=BAG
for k in ['tail1','tail2','rtb1','rtb2','wrapF','wrapB','pl1','pl2','endF','endSt','rwrap']: P['mo_'+k]=SCARF
def stamp(cx,cy,rot,inner):
  return flat(f"<g transform='translate({cx} {cy}) rotate({rot})'>"
    "<rect x='-4.1' y='-4.8' width='8.2' height='9.6' rx='.4' fill='#d9ccb0'/>"
    "<rect x='-4.4' y='-5.1' width='8.2' height='9.6' rx='.4' fill='#FBF4E2' stroke='#FBF4E2' stroke-width='1.2' stroke-dasharray='.01 1.3' stroke-linecap='round'/>"
    f"<rect x='-3' y='-3.6' width='5.4' height='6' fill='{inner}'/>"
    "<path d='M-3 2.4 L-1.2 -.4 L.2 1.2 L1.2 .2 L2.4 1.6 L2.4 2.4Z' fill='#FBF4E2' opacity='.85'/><circle cx='1' cy='-1.9' r='.8' fill='#F2C14E'/>"
    "<path d='M-6.6 -1.4 Q-4.6 -2.6 -2.6 -1.4 Q-.6 -.2 1.4 -1.4' fill='none' stroke='#5b6170' stroke-width='.45' opacity='.7'/>"
    "<path d='M-6.6 .2 Q-4.6 -1 -2.6 .2 Q-.6 1.4 1.4 .2' fill='none' stroke='#5b6170' stroke-width='.45' opacity='.7'/></g>")
ENV_O=flat("<g transform='translate(2.6 -1.4) rotate(10)'><rect x='-6' y='-5.2' width='11' height='7.4' rx='.6' fill='#FFF4DC' stroke='#FFF4DC' stroke-width='2.6' stroke-linejoin='round'/></g>")
ENV=flat("<g transform='translate(2.6 -1.4) rotate(10)'><rect x='-6' y='-5.2' width='11' height='7.4' rx='.6' fill='#FBF6EA'/>"
  "<path d='M-6 -5.2 L-.5 -1.2 L5 -5.2' fill='none' stroke='#d8ccb3' stroke-width='.6'/>"
  "<path d='M-6 -3.6 L-4.4 -5.2 M-3.6 -5.2 L-6 -2.8 M5 -3.6 L3.4 -5.2 M2.6 -5.2 L5 -2.8' stroke='#D8473B' stroke-width='.75'/>"
  "<path d='M-6 -2.2 L-5 -3.2 M4 -5.2 L5 -4.2' stroke='#3A5A93' stroke-width='.75'/>"
  "<rect x='2' y='-3.6' width='2.2' height='2.6' fill='#3CC296'/></g>")
def remit(svg,side):
  svg=recolor(svg,P)
  if side=='front':
    i=svg.rfind("<g data-j='hwb'") if "data-j='hwb'" in svg else None
    j=svg.rfind("</g>",0,svg.rfind("<g data-j='aL'")); svg=svg[:j]+stamp(47.6,84.2,-7,'#3CC296')+svg[j:]
  else:
    svg=after_last(svg,r"<use href='#mo_KM1coat' fill='url\(#mo_ngr\)'/>|<use href='#mo_Mcoat' fill='url\(#mo_ngr\)'/>",stamp(71.5,82,8,'#D8473B'))
  # sobre asomando del bolso: contorno en la capa de silueta y el sobre en la de color, ambos antes de la tapa
  ms=list(re.finditer(r"<use href='#mo_Mbag' x='1.1' y='1.7'",svg))
  svg=svg[:ms[1].start()]+ENV+svg[ms[1].start():]
  svg=svg[:ms[0].start()]+ENV_O+svg[ms[0].start():]
  return svg
new[('remitente','front')]=remit(old[('base','front')],'front')
new[('remitente','back')]=remit(old[('base','back')],'back')
full={**old,**new}
ref=lambda r: full[tuple(r.split('.'))]
for sk in list(MO):
  for k in ['front','back']:
    o=MO[sk][k]
    if isinstance(o,dict) and ((sk,k) in new or tuple(o['r'].split('.')) in new):
      MO[sk][k]={'r':o['r'],'o':enc(ref(o['r']),full[(sk,k)])}
D['mora']['n']['remitente']='Remitente'
MO['remitente']={'front':{'r':'base.front','o':enc(old[('base','front')],new[('remitente','front')])},'back':{'r':'remitente.front','o':enc(new[('remitente','front')],new[('remitente','back')])},'hy':MO['base']['hy'],'piv':MO['base']['piv']}
print('ok',save(s,m,D))
# verificación
s2,m2,D2=load(); edec.__defaults__[0].clear()
for (sk,k),v in full.items():
  assert edec(D2,'mora',sk,k)==v,(sk,k)
print('verificado')
