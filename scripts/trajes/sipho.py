# Sipho: traje de historia «Cambio y fuera» (postal secreta): suéter a rayas rojas y blancas como un faro, gorra azul marino con un farito dorado, pantalón azul.
import sys,os,re,json; sys.path.insert(0,os.path.dirname(__file__)); from edata import *
s,m,D=load(); S=D['sipho']['s']
old={(sk,k):edec(D,'sipho',sk,k) for sk in S for k in ['front','back']}
CREAM={'#D9952B':'#F1E7D2','#b37525':'#cbbfa6','#b87926':'#d4c8af','#c08027':'#dcd0b8','#c88729':'#e3d8c1','#dd9e3c':'#fbf4e4','#c78628':'#e3d8c1','#9f6423':'#a93a30','#bd7d27':'#D2483B'}
CUFF={'#c08027':'#a93a30','#e4b15d':'#D2483B'}
CAP={'#3e3d54':'#22355f','#444558':'#273b68','#4B4E5C':'#2c4373','#5d5e68':'#3d5689','#37364f':'#1d2d52','#3d3c53':'#21335c','#424356':'#253862'}
PANTS={'#4A3B2E':'#2f3a58','#503526':'#263049','#605142':'#3d4968'}
P={}
for k in ['Scw','up0','fo0','up1','fo1','Snk','Sknt']: P['si_'+k]=CREAM
for k in ['cuff0','cuff1']: P['si_'+k]=CUFF
for k in ['Scp','Scpb','Scbk','Scbt']: P['si_'+k]=CAP
for k in ['legL','legR','rleg0','rleg1']: P['si_'+k]=PANTS
RED,RD='#D2483B','#b63f33'
def stripes(clip,ys,h,x0=-20,x1=120,col=RED):
  return ''.join(f"<path d='M{x0} {y}L{x1} {y}L{x1} {y+h}L{x0} {y+h}Z' fill='{col}' clip-path='url(#{clip}c)'/>" for y in ys)
COATS=stripes('si_Scw',[69,78,87,96],4.2)+"<path d='M68 60L100 60L100 104L64 104Z' fill='#5a2a10' opacity='.10' clip-path='url(#si_Scwc)'/>"
SLV=lambda p: stripes(p,[-.6,6.4],3.2,-9,9)+f"<path d='M1.6 -7L9 -7L9 14L1.6 14Z' fill='#5a2a10' opacity='.10' clip-path='url(#{p}c)'/>"
BADGE=flat("<g transform='translate(60 24.2)'><path d='M-1.6 3.4L-1 -2.2L1 -2.2L1.6 3.4Z' fill='#F2C14E'/><path d='M-1.36 1.2L1.36 1.2L1.5 2.4L-1.5 2.4Z' fill='#D2483B'/><path d='M-1.3 -2.2L-1.3 -3.4Q0 -4.6 1.3 -3.4L1.3 -2.2Z' fill='#FFE9A0'/><path d='M-2.6 3.4L2.6 3.4L2.6 4.2L-2.6 4.2Z' fill='#c99a3a'/><path d='M1.6 -3.2L4 -4.2L4 -2.2Z M-1.6 -3.2L-4 -4.2L-4 -2.2Z' fill='#FFE9A0' opacity='.8'/></g>")
def ins_before_last(svg,anchor,x):
  i=svg.rfind(anchor); assert i>0,anchor; return svg[:i]+x+svg[i:]
def build(svg,side):
  svg=recolor(svg,P)
  if side=='front':
    for pid in ['Splk','Sbn78','Sbn86','Sbn94','SpkL','SpkR']: svg=re.sub(r"<use href='#si_%s'[^>]*/>"%pid,'',svg)
  svg=ins_before_last(svg,"<use href='#si_Scw' fill='url(#si_ngr)'/>",COATS)
  for p in ['up0','fo0','up1','fo1']:
    a="<use href='#si_%s' fill='url(#si_ngr)'/>"%p
    while a in svg.replace(a,'',0):
      break
    # todas las apariciones (brazos normales y el de saludo)
    parts=svg.split(a); svg=(SLV('si_'+p)+a).join(parts)
  if side=='front': svg=after_last(svg,r"<use href='#si_Scp' fill='url\(#si_ngr\)'/>",BADGE)
  return svg
new={('faro','front'):build(old[('base','front')],'front'),('faro','back'):build(old[('base','back')],'back')}
D['sipho']['n']['faro']='Cambio y fuera'
S['faro']={'front':{'r':'base.front','o':enc(old[('base','front')],new[('faro','front')])},'back':{'r':'base.back','o':enc(old[('base','back')],new[('faro','back')])},'hy':S['base']['hy'],'piv':S['base']['piv']}
print('ok',save(s,m,D))
s2,m2,D2=load(); edec.__defaults__[0].clear()
for (sk,k),v in {**old,**new}.items(): assert edec(D2,'sipho',sk,k)==v,(sk,k)
print('verificado')
