import {spawnSync} from 'node:child_process';

// Select an installed interpreter without storing workstation paths in source.
// PYTHON also supports an ignored .env.local loaded by the npm command.
const candidates=[];
if(process.env.PYTHON)candidates.push({command:process.env.PYTHON,args:[]});
if(process.platform==='win32')candidates.push({command:'py',args:['-3']});
candidates.push({command:'python3',args:[]},{command:'python',args:[]});
const probe='import sys; print("%d.%d" % sys.version_info[:2]); sys.exit(0 if sys.version_info >= (3, 10) else 1)';
const interpreter=candidates.find(({command,args})=>{
  const result=spawnSync(command,[...args,'-c',probe],{encoding:'utf8',timeout:5000,windowsHide:true});
  return !result.error&&result.status===0&&/^3\.(\d+)\s*$/.test(result.stdout.trim());
});

if(!interpreter){
  console.error('Python 3.10 or newer was not found. Install Python or set PYTHON in your environment or .env.local to its executable path.');
  process.exitCode=1;
}else if(process.argv.length<3){
  console.error('Usage: node scripts/run-python.mjs <script.py> [arguments]');
  process.exitCode=1;
}else{
  const result=spawnSync(interpreter.command,[...interpreter.args,...process.argv.slice(2)],{stdio:'inherit',windowsHide:true});
  if(result.error)console.error(`Unable to run the Python script: ${result.error.message}`);
  process.exitCode=result.error?1:(result.status??1);
}
