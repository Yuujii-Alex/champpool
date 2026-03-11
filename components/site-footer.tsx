export default function SiteFooter() {
  return (
    <footer className="border-t border-white/6 bg-[#0d1014] px-4 py-8 text-sm text-slate-400 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        <p>
          ChampPool was created under Riot Games' <a className="text-slate-200 underline underline-offset-4 hover:text-white" href="https://www.riotgames.com/en/legal" rel="noreferrer" target="_blank">Legal Jibber Jabber</a> policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.
        </p>
        <p>
          This is a student project built to practice software engineering and product development. The recommendations are simple heuristics based on recent data, so they may be inaccurate, incomplete, or not suitable for every player.
        </p>
      </div>
    </footer>
  );
}