/** Small numbered scene label used to pace the homepage storyboard. */
export default function SceneLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="label text-winter">
      {n} <span className="text-stone-arch">—</span> {children}
    </p>
  );
}
