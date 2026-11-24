import re,json
SRC='/home/claude/game/paper-voyager/elenco.js'
def load():
  s=open(SRC).read(); m=re.search(r"const EDATA = (\{.*?\});\n",s,re.S); return s,m,json.loads(m.group(1))
def tok(s):
  t=re.split(r'(?=<)',s)
  return t[1:] if t and t[0]=='' else t
def edec(D,ch,sk,k,memo={}):
  key=(ch,sk,k)
  if key in memo: return memo[key]
  o=D[ch]['s'][sk][k]
  if isinstance(o,str): s=o
  else:
    rs,rk=o['r'].split('.'); A=tok(edec(D,ch,rs,rk)); i=0; s=''
    for p in o['o']:
      if isinstance(p,str): s+=p
      elif p>0: s+=''.join(A[i:i+p]); i+=p
      else: i-=p
  memo[key]=s; return s
def enc(base,new):
  import difflib
  A=tok(base); B=tok(new); out=[]
  sm=difflib.SequenceMatcher(None,A,B,autojunk=False)
  for op,i1,i2,j1,j2 in sm.get_opcodes():
    if op=='equal': out.append(i2-i1)
    else:
      if i2>i1: out.append(-(i2-i1))
      if j2>j1: out.append(''.join(B[j1:j2]))
  # first tok may be '' due to split
  return out

# ── utilidades para trajes ──
def piece(tag):
  h=re.search(r"href='#([^']+)'",tag) or re.search(r"clip-path='url\(#([^']+)c\)'",tag)
  return h.group(1) if h else None
def recolor(svg,P):
  out=[]
  for tk in tok(svg):
    mp=P.get(piece(tk))
    if mp: tk=re.sub(r"fill='(#[0-9A-Fa-f]{6})'",lambda m_: "fill='%s'"%mp.get(m_.group(1),m_.group(1)),tk)
    out.append(tk)
  return ''.join(out)
def flat(g):
  m=re.match(r"<g transform='([^']+)'>(.*)</g>$",g,re.S); tr,body=m.group(1),m.group(2)
  return re.sub(r"<(path|circle|rect|ellipse) ",lambda x:"<%s transform='%s' "%(x.group(1),tr),body)
def bbox(svg,pid):
  d=re.search(r"<path id='%s' d='([^']+)'"%pid,svg).group(1)
  nums=[float(x) for x in re.findall(r"-?\d*\.?\d+",d)]
  # M x y + relativos l (pares)
  x,y=nums[0],nums[1]; xs=[x]; ys=[y]
  for i in range(2,len(nums)-1,2): x+=nums[i]; y+=nums[i+1]; xs.append(x); ys.append(y)
  return round(min(xs),1),round(min(ys),1),round(max(xs),1),round(max(ys),1)
def after_last(svg,anchor_re,ins):
  ms=list(re.finditer(anchor_re,svg)); m_=ms[-1]; return svg[:m_.end()]+ins+svg[m_.end():]
def save(s,m,D):
  out=s[:m.start(1)]+json.dumps(D,ensure_ascii=False,separators=(',',':'))+s[m.end(1):]
  open(SRC,'w').write(out); return len(out)-len(s)
