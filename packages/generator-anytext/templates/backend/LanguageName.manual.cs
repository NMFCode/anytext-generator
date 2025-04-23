using NMF.AnyText;

namespace <%= LanguageName %>LspServer.<%= LanguageName %>
{
    // Use this file to add manual extensions to your grammar, especially to customize editor services
    public partial class <%= LanguageName %>Grammar
    {
        public partial class PersonRule
        {
            // Marking a rule with a symbol kind has multiple consequences: It activates the document outline views and also registers the symbol for completion requests
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
                        // This is the text that should be displayed, use Title for a static text or Title Func to insert a delegate
                        TitleFunc = (g, args) => $"Greet {g.Greeted.Name}",

                        // This is the identifier for the command, needs to be unique
                        CommandIdentifier = "hello.greet",

                        // This is the delegate that is executed when the user clicks on the lens, can be empty
                        Action = (g, args) => _ = args.ShowNotification($"Hello, {g.Greeted.Name}!")
                    };
                }
            }
        }
    }
}
