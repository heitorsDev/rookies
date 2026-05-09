interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditTypePage({ params }: Props) {
  const { slug } = await params;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit {slug}</h1>
    </div>
  );
}
