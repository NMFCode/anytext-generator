using NMF.AnyText;
using System.Diagnostics;

if (args.Length == 1 && args[0] == "debug")
{
    Debugger.Launch();
}
await Bootstrapper.RunLspServerOnStandardInStandardOutAsync();
