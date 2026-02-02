import PlansTable from "@/components/PlansTable";

const Index = () => {
  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Feature gating
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {"One place to manage all your plans and features and enable or disable them as per your needs"}
          </p>
        </div>

        {/* Plans Comparison Table */}
        <PlansTable />
      </div>
    </div>
  );
};

export default Index;
