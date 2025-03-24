using <%= LanguageName %>LspServer.<%= LanguageName %>;
using NMF.AnyText;
using System.Diagnostics;

#if DEBUG
if (args.Length == 1 && args[0] == "debug")
{
    Debugger.Launch();
}
#endif
await Bootstrapper.RunLspServerOnStandardInStandardOutAsync(new <%= LanguageName %>Grammar());
