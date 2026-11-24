# Anaya: traje de historia «Color Anaya» (postal secreta): kurta carmín de cochinilla con estampado dorado de Jaipur, ribete dorado,
#        y el pañuelo mitad rojo de Marrakech, mitad azul de los azulejos de Estambul. La banderita de la silla también es del color.
import sys,os,re,json; sys.path.insert(0,os.path.dirname(__file__)); from edata import *
s,m,D=load(); S=D['anaya']['s']
old={(sk,k):edec(D,'anaya',sk,k) for sk in S for k in ['front','back']}
CR={'#D9507E':'#B8233F','#b3455f':'#8e1a31','#ca4b72':'#a61f39','#dd6086':'#c93a52','#c74b70':'#a61f39'}
HEM={'#bd4868':'#D9A63A'}
CUFF={'#c0486a':'#b8862e','#e48097':'#E9BE52'}
BLUE={'#F2A32A':'#2F6FB8','#c47f25':'#21508a','#e39728':'#2a63a6','#e69929':'#2a63a6','#da9027':'#2a63a6','#ca8425':'#245a98','#c58431':'#21508a','#f3ab3b':'#4a86cc','#d48b26':'#2a63a6','#af6e22':'#1d4a80','#dd9227':'#2a63a6'}
RED={'#F2A32A':'#E5424C','#c47f25':'#a8262f','#da9027':'#cf3640','#ca8425':'#c2323b','#dd9227':'#cf3640','#c58431':'#97222b','#f3ab3b':'#e0505a'}
FLAG={'#B8820E':'#8e1a31','#E08A1E':'#B8233F','#F2C230':'#2F6FB8'}
PACK={'#543e83':'#1d4a80','#5c448d':'#21508a','#624894':'#2a63a6','#6B4FA0':'#2F6FB8','#503b7e':'#1b4577','#8066a7':'#4a86cc'}
P={}
for k in ['coat','up0','fo0','up1','fo1']: P['an_'+k]=CR
P['an_hem']=HEM
for k in ['cuff0','cuff1']: P['an_'+k]=CUFF
for k in ['wrapF','wrapB','rwrap','pl2','tail2']: P['an_'+k]=BLUE
for k in ['pl1','endF','endSt','tail1']: P['an_'+k]=RED
P['an_Nfg']=FLAG
for k in ['Npk','Npf']: P['an_'+k]=PACK
def print_(clip,pts):
  o=''
  for x,y in pts:
    o+=(f"<circle cx='{x}' cy='{y}' r='1.15' fill='none' stroke='#E9BE52' stroke-width='.5' opacity='.85' clip-path='url(#{clip}c)'/>"
        f"<circle cx='{x}' cy='{y}' r='.35' fill='#E9BE52' opacity='.85' clip-path='url(#{clip}c)'/>")
  return o
PTS=[(x+(3.4 if (j%2) else 0),y) for j,y in enumerate([60,66.6,73.2,79.8]) for x in [38.5,45.3,52.1,58.9,65.7,72.5,79.3]]
EDGE=lambda clip: f"<path d='M-9 7.6L9 7.6L9 9L-9 9Z' fill='#E9BE52' clip-path='url(#{clip}c)'/>"
def build(svg,side):
  svg=recolor(svg,P)
  svg=svg.replace("<use href='#an_coat' fill='url(#an_ngr)'/>",print_('an_coat',PTS)+"<use href='#an_coat' fill='url(#an_ngr)'/>")
  if side=='front':
    svg=after_last(svg,r"<use href='#an_endSt' fill='#[^']+'/>","<path d='M-5 16.6L6 16.6L6 18.2L-5 18.2Z' fill='#E9BE52' clip-path='url(#an_endFc)'/>")
  return svg
new={('color','front'):build(old[('base','front')],'front'),('color','back'):build(old[('base','back')],'back')}
D['anaya']['n']['color']='Color Anaya'
S['color']={'front':{'r':'base.front','o':enc(old[('base','front')],new[('color','front')])},'back':{'r':'base.back','o':enc(old[('base','back')],new[('color','back')])},'hy':S['base']['hy'],'piv':S['base']['piv']}
print('ok',save(s,m,D))
s2,m2,D2=load(); edec.__defaults__[0].clear()
for (sk,k),v in {**old,**new}.items(): assert edec(D2,'anaya',sk,k)==v,(sk,k)
print('verificado')
