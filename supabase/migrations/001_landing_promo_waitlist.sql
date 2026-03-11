create table promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  industry text not null,
  max_uses int not null default 50,
  current_uses int not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

create table code_redemptions (
  id uuid primary key default gen_random_uuid(),
  code text not null references promo_codes(code),
  industry text not null,
  created_at timestamptz default now()
);

create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  industry text,
  created_at timestamptz default now()
);

alter table promo_codes enable row level security;
alter table code_redemptions enable row level security;
alter table waitlist enable row level security;

create or replace function validate_promo_code(code_input text)
returns table(success boolean, industry text, reason text)
language plpgsql
as $$
declare
  v_industry text;
  v_updated int;
begin
  update promo_codes
  set current_uses = current_uses + 1
  where code = code_input
    and active = true
    and current_uses < max_uses;

  get diagnostics v_updated = row_count;

  if v_updated = 0 then
    select p.industry into v_industry
    from promo_codes p
    where p.code = code_input and p.active = true;

    if v_industry is not null then
      return query select false, v_industry, 'exhausted'::text;
    else
      return query select false, null::text, 'invalid'::text;
    end if;
  else
    select p.industry into v_industry
    from promo_codes p
    where p.code = code_input;

    return query select true, v_industry, null::text;
  end if;
end;
$$;

insert into promo_codes (code, industry, max_uses) values
  ('CONSTRUCTION-VIP', 'construction', 50),
  ('INSURANCE-VIP', 'insurance', 50),
  ('STAFFING-VIP', 'staffing', 50),
  ('LAW-VIP', 'law', 50),
  ('ACCOUNTING-VIP', 'accounting', 50),
  ('MARKETING-VIP', 'marketing', 50),
  ('ARCHITECTURE-VIP', 'architecture', 50),
  ('HEALTH-VIP', 'health', 50),
  ('AUTOMOTIVE-VIP', 'automotive', 50),
  ('MEDICAL-VIP', 'medical', 50),
  ('FINANCE-VIP', 'financial-services', 50),
  ('IT-VIP', 'it', 50),
  ('CONSULTING-VIP', 'consulting', 50),
  ('HOSPITALITY-VIP', 'hospitality', 50),
  ('LOGISTICS-VIP', 'logistics', 50),
  ('ENVIRONMENTAL-VIP', 'environmental', 50),
  ('EDUCATION-VIP', 'education', 50),
  ('TELECOM-VIP', 'telecom', 50);
