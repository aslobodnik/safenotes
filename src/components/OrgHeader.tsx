import { Organization } from '@/db/schema';

interface OrgHeaderProps {
  organization: Organization;
}

export function OrgHeader({ organization}: OrgHeaderProps) {
  return (
    <div className="flex justify-between">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold">{organization?.name}</h1>
            <div className="text-neutral-500">{organization?.description}</div>
          </div>
          {/* hiding org logo for now */}
          {/* <div className="flex flex-col items-end gap-3">
            <img
              src={organization?.logoImage}
              alt={`${organization?.name} Logo`}
              className="w-20 h-20"
            />
            
          </div> */}
    </div>
  );
}
