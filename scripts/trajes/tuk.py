# Tuk: traje de historia «Cartero de honor» (postal secreta): gorro azul correo con banda dorada y pompón rojo, cuello rojo, cartera de cuero rojo y la medalla de «el cartero que no se rindió».
import sys,os,re,json; sys.path.insert(0,os.path.dirname(__file__)); from edata import *
s,m,D=load(); S=D['tuk']['s']
old={(sk,k):edec(D,'tuk',sk,k) for sk in S for k in ['front','back']}
CAP={'#2F8C8A':'#2E4A86','#2a6974':'#22386a','#2b6f78':'#273f75','#2c797e':'#2b4580'}
BAND={'#275669':'#b88a2a','#2b727a':'#E2B33C','#F3E6C4':'#FFF1C9'}
POM={'#C9B48A':'#a93a30','#F3E6C4':'#D9452C'}
YOKE={'#2F8C8A':'#C8402A','#F3E6C4':'#F2C14E','#6B4A34':'#6B4A34'}
BAG={'#7c4c31':'#7d2620','#825235':'#8f2c24','#8A5A3B':'#A8352B','#9f7556':'#C2453A'}
P={}
for k in ['Tbn']: P['tu_'+k]=CAP
P['tu_Tbnb']=BAND; P['tu_Tpp']=POM
for k in ['Tyk','Tykb']: P['tu_'+k]=YOKE
for k in ['Tmb','Tmbf']: P['tu_'+k]=BAG
MEDAL=flat("<g transform='translate(52.4 85.4) scale(1.35)'>"
  "<path d='M-3 -7.4L-.6 -1.2L.9 -1.6L-.9 -7.4Z' fill='#2E4A86'/><path d='M3 -7.4L.6 -1.2L-.9 -1.6L.9 -7.4Z' fill='#C8402A'/>"
  "<circle cx='.4' cy='.6' r='3.4' fill='#b88a2a'/><circle cx='0' cy='0' r='3.4' fill='#E2B33C'/><circle cx='0' cy='0' r='2.4' fill='#F2C94E'/>"
  "<path d='M-1.5 -.8L1.5 -.8L1.5 1.2L-1.5 1.2Z' fill='#FFF8EA'/><path d='M-1.5 -.8L0 .4L1.5 -.8' fill='none' stroke='#C8402A' stroke-width='.45'/>"
  "<circle cx='-1.4' cy='-1.4' r='.6' fill='#FFFFFF' opacity='.7'/></g>")
def build(svg,side):
  svg=recolor(svg,P)
  if side=='front':
    svg=after_last(svg,r"<use href='#tu_Tstr' fill='#[^']+'/>",MEDAL)
  return svg
new={('honor','front'):build(old[('base','front')],'front'),('honor','back'):build(old[('base','back')],'back')}
D['tuk']['n']['honor']='Cartero de honor'
S['honor']={'front':{'r':'base.front','o':enc(old[('base','front')],new[('honor','front')])},'back':{'r':'base.back','o':enc(old[('base','back')],new[('honor','back')])},'hy':S['base']['hy'],'piv':S['base']['piv']}
print('ok',save(s,m,D))
s2,m2,D2=load(); edec.__defaults__[0].clear()
for (sk,k),v in {**old,**new}.items(): assert edec(D2,'tuk',sk,k)==v,(sk,k)
print('verificado')
