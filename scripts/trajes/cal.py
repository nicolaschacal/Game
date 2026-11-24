# Cal: traje de historia «Cumbres para dos» (postal secreta): chaleco de alta montaña verde azulado con mangas crema, cuerda roja de escalada cruzada al pecho y enrollada en la mochila.
import sys,os,re,json; sys.path.insert(0,os.path.dirname(__file__)); from edata import *
s,m,D=load(); S=D['cal']['s']
old={(sk,k):edec(D,'cal',sk,k) for sk in S for k in ['front','back']}
SH={'#355482':'#c9c0ad','#385c8b':'#d4cbb8','#3F6E9E':'#EDE6D6','#3b6392':'#ddd5c3','#527ba3':'#f7f2e6','#3a6291':'#ddd5c3','#7995ae':'#2E8C8A','#304472':'#24706f','#375887':'#2E8C8A'}
CUFF={'#385c8b':'#24706f','#7995ae':'#3aa3a0'}
VS={'#E0663A':'#2E8C8A','#b85430':'#1f6665','#c35933':'#247776','#e4774c':'#41a5a2','#d36037':'#28807f','#c55a33':'#247776','#cf5e36':'#28807f','#e37449':'#41a5a2'}
PK={'#4E7A4A':'#4b515e','#506c41':'#3a3f4b','#51663e':'#353a45','#52603a':'#30353f','#52623b':'#333843'}
MT={'#3586a0':'#c9b48a','#3999b0':'#d9c69c','#3FB6C9':'#EADCB4'}
PANTS={'#7b5e40':'#3a3f4b','#8C7A55':'#4b515e','#9a8864':'#5c6372'}
P={}
for k in ['Ush','up0','fo0','up1','fo1']: P['ca_'+k]=SH
P['ca_Ucl']=SH
for k in ['cuff0','cuff1']: P['ca_'+k]=CUFF
for k in ['Uvl','Uvr','Uvb']: P['ca_'+k]=VS
P['ca_Upk']=PK; P['ca_Umt']=MT
for k in ['legL','legR','rleg0','rleg1']: P['ca_'+k]=PANTS
ROPE_F=("<path d='M44.6 62.4 Q56 76 73.4 89.6' fill='none' stroke='#8f2c20' stroke-width='3.4' stroke-linecap='round' transform='translate(.5 .8)'/>"
  "<path d='M44.6 62.4 Q56 76 73.4 89.6' fill='none' stroke='#D9452C' stroke-width='3.4' stroke-linecap='round'/>"
  "<path d='M44.6 62.4 Q56 76 73.4 89.6' fill='none' stroke='#FFF4DC' stroke-width='.7' stroke-dasharray='1.2 2.2' opacity='.85'/>"
  "<path d='M47.2 61.4 Q58.6 75 75.6 88.4' fill='none' stroke='#D9452C' stroke-width='2' stroke-linecap='round' opacity='.85'/>")
def coil(cx,cy):
  o=''
  for r,c in [(8.2,'#8f2c20'),(7.6,'#D9452C'),(5.6,'#c23b27'),(3.8,'#D9452C')]:
    o+=f"<ellipse cx='{cx}' cy='{cy}' rx='{r}' ry='{r*.62}' fill='none' stroke='{c}' stroke-width='1.9'/>"
  o+=f"<ellipse cx='{cx}' cy='{cy}' rx='7.6' ry='4.7' fill='none' stroke='#FFF4DC' stroke-width='.5' stroke-dasharray='1 2.4' opacity='.8'/>"
  o+=f"<path d='M{cx-1.4} {cy-5.4}L{cx+1.4} {cy-5.4}L{cx+1.4} {cy+5.4}L{cx-1.4} {cy+5.4}Z' fill='#E9BE52'/>"
  return o
def build(svg,side):
  svg=recolor(svg,P)
  if side=='front':
    i=svg.rfind("<use href='#ca_Ucb'"); j=svg.rfind("<g",0,i); svg=svg[:j]+ROPE_F+svg[j:]
  else:
    svg=after_last(svg,r"<use href='#ca_Upk' fill='url\(#ca_ngr\)'/>",coil(60,78))
  return svg
new={('cumbres','front'):build(old[('base','front')],'front'),('cumbres','back'):build(old[('base','back')],'back')}
D['cal']['n']['cumbres']='Cumbres para dos'
S['cumbres']={'front':{'r':'base.front','o':enc(old[('base','front')],new[('cumbres','front')])},'back':{'r':'base.back','o':enc(old[('base','back')],new[('cumbres','back')])},'hy':S['base']['hy'],'piv':S['base']['piv']}
print('ok',save(s,m,D))
s2,m2,D2=load(); edec.__defaults__[0].clear()
for (sk,k),v in {**old,**new}.items(): assert edec(D2,'cal',sk,k)==v,(sk,k)
print('verificado')
