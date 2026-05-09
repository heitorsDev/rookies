interface Props {
  params: Promise<{ code: string }>;
}

export default async function EditComponentPage({ params }: Props) {
  const { code } = await params;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit {code}</h1>
    </div>
  );
}
