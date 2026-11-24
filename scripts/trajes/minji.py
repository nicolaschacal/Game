# Minji: 1) rehace «Escenario» (sus datos estaban corruptos: brazo violeta flotando y piezas duplicadas) recoloreando la base
#        2) traje de historia «Dúo» (postal secreta): campera varsity coral con mangas crema, auriculares lila y parche de corazón.
import sys,os,re,json; sys.path.insert(0,os.path.dirname(__file__)); from edata import *
s,m,D=load(); S=D['minji']['s']
old={(sk,k):edec(D,'minji',sk,k) for sk in S for k in ['front','back']}
JK={'#6b52a6':'#272339','#8C6BD1':'#2B2836','#7e60be':'#292637','#9878d1':'#403c46','#765ab4':'#282438','#7d5fbd':'#292537','#6d53a8':'#272339','#af93d1':'#6b6465'}
SHOE={'#c4b3a8':'#bd3d26','#F1EEE6':'#E8452C','#d9cfc5':'#d14129'}
RED={'#539192':'#b63c25','#6FD3BE':'#E8452C','#64b9ac':'#d44129','#67c0b1':'#da422a'}
CASE={'#29243f':'#5a2a25','#2E2A3E':'#5A2A2A','#2b263e':'#5a2a26','#474250':'#6e423e'}
PE={}
for k in ['Jcw','Jblt','up0','fo0','up1','fo1','cuff0','cuff1']: PE['mi_'+k]=JK
for k in ['bootL','bootR','rbt0','rbt1','rsb0','rsb1']: PE['mi_'+k]=SHOE
for k in ['Jb5472','Jb6672','Jb5490','Jb6690','Jtie','Jphb','Jpbb','Jsk2']: PE['mi_'+k]=RED
PE['mi_Jcs']=CASE
def esc(svg):
  svg=recolor(svg,PE)
  # el clip interno del auricular (puntito menta del logo) también rojo en el cintillo
  return svg.replace("<path d='M45.3 13.6l-6 12 1.4 .8 6-12z' fill='#615b5a'","<path d='M45.3 13.6l-6 12 1.4 .8 6-12z' fill='#615b5a'")
new={('escenario','front'):esc(old[('base','front')]),('escenario','back'):esc(old[('base','back')])}
# ── «Dúo» ──
COR={'#6b52a6':'#b9525f','#8C6BD1':'#E8697A','#7e60be':'#d55e6f','#9878d1':'#f08593','#765ab4':'#c95a69','#6d53a8':'#a94a57'}
SLV={'#6b52a6':'#cbbda6','#8C6BD1':'#F4EBDD','#7d5fbd':'#e2d7c5'}
CUFF={'#765ab4':'#a94a57','#af93d1':'#E8697A'}
LIL={'#539192':'#7c62b8','#6FD3BE':'#A98BE0','#64b9ac':'#9a7bd6','#67c0b1':'#9f82d9','#62b5aa':'#9a7bd6'}
BTN={'#6FD3BE':'#F4EBDD'}
PD={}
for k in ['Jcw','Jblt']: PD['mi_'+k]=COR
for k in ['up0','fo0','up1','fo1']: PD['mi_'+k]=SLV
for k in ['cuff0','cuff1']: PD['mi_'+k]=CUFF
for k in ['Jphb','Jpbb','JcuL','JcuR','Jtie','Jsk2']: PD['mi_'+k]=LIL
for k in ['Jb5472','Jb6672','Jb5490','Jb6690']: PD['mi_'+k]=BTN
def stripes(p): return ''.join(f"<path d='M-9 {y}L9 {y}L9 {y+1.3}L-9 {y+1.3}Z' fill='{c}' clip-path='url(#{p}c)'/>" for y,c in [(1.2,'#E8697A'),(3.2,'#A98BE0')])
HEART=lambda x,y,sc,c1,c2: flat(f"<g transform='translate({x} {y}) scale({sc})'><path d='M0 3.6 C-4.6 .6 -4.4 -3.2 -1.9 -3.2 C-.9 -3.2 -.2 -2.5 0 -1.8 C.2 -2.5 .9 -3.2 1.9 -3.2 C4.4 -3.2 4.6 .6 0 3.6Z' fill='{c1}'/><path d='M0 2.5 C-3.3 .4 -3.1 -2.3 -1.6 -2.3 C-.8 -2.3 -.2 -1.7 0 -1 C.2 -1.7 .8 -2.3 1.6 -2.3 C3.1 -2.3 3.3 .4 0 2.5Z' fill='{c2}'/><circle cx='-1.2' cy='-1.1' r='.5' fill='#FFFFFF' opacity='.8'/></g>")
def duo(svg,side):
  svg=recolor(svg,PD)
  for p in ['fo0','fo1']:
    a="<use href='#mi_%s' fill='url(#mi_ngr)'/>"%p
    svg=(stripes('mi_'+p)+a).join(svg.split(a))
  if side=='front':
    j=svg.rfind("</g>",0,svg.rfind("<g data-j='aL'")); svg=svg[:j]+HEART(72.6,75.6,1,'#F4EBDD','#A98BE0')+svg[j:]
  else:
    svg=after_last(svg,r"<use href='#mi_Jsk3' fill='#[^']+'/>",HEART(-5.4,-40,1.25,'#F4EBDD','#E8697A'))
  return svg
new[('duo','front')]=duo(old[('base','front')],'front'); new[('duo','back')]=duo(old[('base','back')],'back')
for k in ['front','back']:
  r='base.'+k; S['escenario'][k]={'r':r,'o':enc(old[('base',k)],new[('escenario',k)])}
D['minji']['n']['duo']='Dúo'
S['duo']={'front':{'r':'base.front','o':enc(old[('base','front')],new[('duo','front')])},'back':{'r':'base.back','o':enc(old[('base','back')],new[('duo','back')])},'hy':S['base']['hy'],'piv':S['base']['piv']}
print('ok',save(s,m,D))
s2,m2,D2=load(); edec.__defaults__[0].clear()
for (sk,k),v in {**old,**new}.items():
  if (sk,k) in new or sk=='base': assert edec(D2,'minji',sk,k)==v,(sk,k)
print('verificado')
