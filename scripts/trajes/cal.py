# Cal: traje de historia «Cumbres para dos» (postal secreta): chaleco de alta montaña verde azulado con mangas crema, casco de escalada naranja
#      con linterna y la Polaroid de la cumbre del Kilimanjaro pegada como sticker, y parche de una montaña con dos banderitas.
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
DOME="M32.6 25.6 Q31.4 3.2 60 2 Q88.6 3.2 87.4 25.6 Z"
RIM="M30.6 22.4 Q60 18.6 89.4 22.4 L89.6 26.6 Q60 23 30.4 26.6 Z"
HELM_O=f"<path d='{DOME}'/><path d='{RIM}'/>"
def helmet(front):
  o=(f"<path d='{DOME}' fill='#a8462a' transform='translate(1 1.6)'/><path d='{DOME}' fill='#E0663A'/>"
     "<path d='M66 2 Q86 4 87.4 25.6 L72 25.6 Q72 10 66 2Z' fill='#c75632'/>"
     "<path d='M40 12 Q46 5.4 56 4.4' fill='none' stroke='#F49B72' stroke-width='2.2' stroke-linecap='round' opacity='.8'/>"
     f"<path d='{RIM}' fill='#2f343e'/><path d='M30.6 22.4 Q60 18.6 89.4 22.4 L89.5 23.6 Q60 19.9 30.5 23.6Z' fill='#4b515e'/>")
  if front:
    o+=("<path d='M47 9 L49.6 8.2 L50.2 13.4 L47.6 14Z M70.4 8.2 L73 9 L72.4 14 L69.8 13.4Z' fill='#a8462a'/>"
        "<rect x='54.4' y='12.4' width='11.2' height='6.8' rx='2.2' fill='#2f343e'/><circle cx='60' cy='15.8' r='2.4' fill='#FFE9A0'/><circle cx='60' cy='15.8' r='1.3' fill='#FFFDF0'/>"
        "<path d='M33.4 26 L36.6 44' stroke='#2f343e' stroke-width='1.3' stroke-linecap='round'/><path d='M86.6 26 L83.4 44' stroke='#2f343e' stroke-width='1.3' stroke-linecap='round'/>"
        )
    o+=flat("<g transform='translate(77.2 13.2) rotate(14)'><rect x='-4' y='-4.6' width='8' height='9.2' rx='.4' fill='#d8cfbc'/><rect x='-4.3' y='-4.9' width='8' height='9.2' rx='.4' fill='#FFFDF6'/>"
            "<rect x='-3.3' y='-3.9' width='6' height='5.6' fill='#8FD0E8'/><path d='M-3.3 1.7 L-1 -1.6 L.4 -.2 L1.6 -2.4 L2.7 1.7Z' fill='#5A6A7A'/><path d='M1 -1.6 L1.6 -2.4 L2.2 -1.6Z' fill='#FFFFFF'/></g>")
  else:
    o+=("<path d='M33.6 15 Q60 9.6 86.4 15 L86.8 18.2 Q60 12.8 33.2 18.2Z' fill='#2f343e'/>"
        "<rect x='55.4' y='10.4' width='9.2' height='6' rx='1.6' fill='#3a3f4b'/><circle cx='60' cy='13.4' r='1.1' fill='#D9452C'/>")
  return o
PATCH=flat("<g transform='translate(44.4 69.6) rotate(-8)'><rect x='-4.6' y='-4' width='9.2' height='8' rx='1.6' fill='#1f6665'/><rect x='-4.1' y='-3.5' width='8.2' height='7' rx='1.2' fill='#F3E6C4'/>"
  "<path d='M-3.6 3 L-.6 -2 L1 .2 L1.8 -.8 L3.6 3Z' fill='#6b7280'/><path d='M-1.5 -.5 L-.6 -2 L.3 -.6Z' fill='#FFFFFF'/>"
  "<path d='M-.6 -2 L-.6 -4.2' stroke='#2f343e' stroke-width='.35'/><path d='M-.6 -4.2 L.9 -3.7 L-.6 -3.2Z' fill='#D9452C'/>"
  "<path d='M1.8 -.8 L1.8 -3.2' stroke='#2f343e' stroke-width='.35'/><path d='M1.8 -3.2 L3.2 -2.7 L1.8 -2.2Z' fill='#E9BE52'/></g>")
def build(svg,side):
  svg=recolor(svg,P)
  h='ca_Uhr' if side=='front' else 'ca_Uhb'
  a="<use href='#%s'/></g>"%h; assert svg.count(a)==1,(side,svg.count(a)); svg=svg.replace(a,"<use href='#%s'/>"%h+HELM_O+"</g>")
  svg=after_last(svg,r"<use href='#%s' fill='url\(#ca_ngr\)'/>"%h,helmet(side=='front'))
  if side=='front':
    i=svg.rfind("<use href='#ca_Ucb'"); j=svg.rfind("<g",0,i); svg=svg[:j]+PATCH+svg[j:]
  return svg
new={('cumbres','front'):build(old[('base','front')],'front'),('cumbres','back'):build(old[('base','back')],'back')}
D['cal']['n']['cumbres']='Cumbres para dos'
S['cumbres']={'front':{'r':'base.front','o':enc(old[('base','front')],new[('cumbres','front')])},'back':{'r':'base.back','o':enc(old[('base','back')],new[('cumbres','back')])},'hy':S['base']['hy'],'piv':S['base']['piv']}
print('ok',save(s,m,D))
s2,m2,D2=load(); edec.__defaults__[0].clear()
for (sk,k),v in {**old,**new}.items(): assert edec(D2,'cal',sk,k)==v,(sk,k)
print('verificado')
