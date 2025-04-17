using NMF.AnyText;

namespace <%= LanguageName %>LspServer.<%= LanguageName %>
{
    public partial class <%= LanguageName %>Grammar
    {
        public partial class PersonRule
        {
            public override SymbolKind SymbolKind => SymbolKind.Object;
        }

        public partial class GreetingRule
        {
            protected override IEnumerable<CodeLensInfo<Greeting>> CodeLenses
            {
                get
                {
                    yield return new CodeLensInfo<Greeting>
                    {
                        Title = "Greet",
                        Action = (g, args) => _ = args.ShowNotification($"Hello, {g.Greeted.Name}!")
                    };
                }
            }
        }
    }
}
