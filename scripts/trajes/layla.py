# Layla: traje de historia «L-18» (postal secreta): campera azul noche con estrellitas y el cometa L-18 cruzándola, mochila dorada con estrellas.
import sys,os,re,json; sys.path.insert(0,os.path.dirname(__file__)); from edata import *
s,m,D=load(); S=D['layla']['s']
old={(sk,k):edec(D,'layla',sk,k) for sk in S for k in ['front','back']}
JK={'#5E7A4A':'#2F3270','#5c5a36':'#1f2150','#5d603a':'#23265a','#5d623b':'#262a60','#5d6a40':'#2a2d66','#5d7044':'#2c2f6a','#6e8658':'#3e4288','#5d6f43':'#2c2f6a','#8e9e73':'#6a6fb6','#5c5533':'#1d1f4b','#5c5c37':'#202352','#5d683f':'#25285e'}
TEE={'#F3E6C4':'#E8E4F6','#e4d3b3':'#cfc9e8'}
PACK={'#292f5b':'#b4822c','#2E3A66':'#D9A23A','#2b345f':'#c8922f'}
P={}
for k in ['Ljk','Lco','up0','fo0','up1','fo1','cuff0','cuff1']: P['la_'+k]=JK
P['la_Lte']=TEE; P['la_Lpk']=PACK
def dots(clip,pts,col='#FFF3C4'):
  return ''.join(f"<circle cx='{x}' cy='{y}' r='{r}' fill='{col}' clip-path='url(#{clip}c)'/>" for x,y,r in pts)
COMET=("<path d='M66.8 70.2 Q55 76 43 90 Q57 79 67.6 72.4Z' fill='#F2C14E' opacity='.35' clip-path='url(#la_Ljkc)'/>"
  "<path d='M66.6 70.6 Q57 77.6 47 90.6 Q58.4 80 67.4 72Z' fill='#F7D978' opacity='.6' clip-path='url(#la_Ljkc)'/>"
  "<path d='M66.8 70.9 Q60.2 76.4 53.4 84 Q61.4 77.8 67.4 71.7Z' fill='#FFF3C4' opacity='.9' clip-path='url(#la_Ljkc)'/>"
  "<circle cx='67.2' cy='71.2' r='2.3' fill='#FFE48A'/><circle cx='67.2' cy='71.2' r='1.3' fill='#FFFDF0'/>")
STARS=dots('la_Ljk',[(46,68,.55),(75,66,.5),(58,94,.5),(70,88,.45),(49,80,.4),(62,64.5,.4),(42,95,.45),(77,97,.45)])
PSTARS=dots('la_Lpk',[(50,72,.8),(66,70,.7),(58,80,.9),(70,86,.7),(49,87,.6)],'#FFF6D8')
def build(svg,side):
  svg=recolor(svg,P)
  svg=svg.replace("<use href='#la_Ljk' fill='url(#la_ngr)'/>",STARS+"<use href='#la_Ljk' fill='url(#la_ngr)'/>")
  if side=='front': svg=after_last(svg,r"<use href='#la_Ljk' fill='url\(#la_ngr\)'/>",COMET)
  else: svg=after_last(svg,r"<use href='#la_Lpk' fill='#[^']+'/>",PSTARS)
  for p in ['up0','up1','fo0','fo1']:
    a="<use href='#la_%s' fill='url(#la_ngr)'/>"%p
    svg=(dots('la_'+p,[(1.5,1,.45),(-2,6,.4)])+a).join(svg.split(a))
  return svg
new={('l18','front'):build(old[('base','front')],'front'),('l18','back'):build(old[('base','back')],'back')}
D['layla']['n']['l18']='L-18'
S['l18']={'front':{'r':'base.front','o':enc(old[('base','front')],new[('l18','front')])},'back':{'r':'base.back','o':enc(old[('base','back')],new[('l18','back')])},'hy':S['base']['hy']}
if 'piv' in S['base']: S['l18']['piv']=S['base']['piv']
print('ok',save(s,m,D))
s2,m2,D2=load(); edec.__defaults__[0].clear()
for (sk,k),v in {**old,**new}.items(): assert edec(D2,'layla',sk,k)==v,(sk,k)
print('verificado')
