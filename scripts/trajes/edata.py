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
