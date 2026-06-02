import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import {
    Chip,
    Divider,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import type { ICountry, IKycFormValues, ISegment } from '~/lib/types/kyc';

interface ReviewStepProps {
  values: IKycFormValues
  countries?: ICountry[]
  segments?: ISegment[]
}

export default function ReviewStep({ values, countries = [], segments = [] }: ReviewStepProps) {
  const { profile, addresses, accounts, wealthSources, documents } = values;

  const countryName = (id: number | '' | null | undefined) => {
    if (id === '' || id == null) return '-';
    return countries.find(c => c.id === id)?.name ?? String(id);
  };
  const segmentName = (id: number | '' | null | undefined) => {
    if (id === '' || id == null) return '-';
    return segments.find(s => s.id === id)?.name ?? String(id);
  };

  return (
    <Stack spacing={3}>
      {/* Core profile */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Customer Profile
        </Typography>
        <Divider sx={{ mb: 1.5 }} />

        <Stack spacing={0.5}>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <InfoItem label="Customer ID" value={profile.cus_id} />
            <InfoItem label="Full Name" value={profile.name} />
            <InfoItem label="Date of Birth" value={profile.dob} />
          </Stack>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <InfoItem label="Gender" value={profile.gender} />
            <InfoItem label="Marital Status" value={profile.marital_status} />
            <InfoItem label="Nationality" value={countryName(profile.nationality)} />
            <InfoItem label="Country of Birth" value={countryName(profile.country_of_birth)} />
          </Stack>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <InfoItem label="Occupation" value={profile.occupation} />
            <InfoItem label="Employer" value={profile.employer_name} />
          </Stack>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <InfoItem label="Email" value={profile.email} />
            <InfoItem label="Mobile" value={profile.mobile} />
          </Stack>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <InfoItem label="Address" value={profile.address} />
            <InfoItem label="City" value={profile.city} />
            <InfoItem label="State / Segment" value={segmentName(profile.state)} />
            <InfoItem label="Country" value={countryName(profile.country)} />
            <InfoItem label="Zip" value={profile.zipcode} />
          </Stack>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <InfoItem label="Passport #" value={profile.passport_no} />
            <InfoItem label="Passport Country" value={countryName(profile.passport_country)} />
            <InfoItem label="Issued" value={profile.passport_issue_date} />
            <InfoItem label="Expires" value={profile.passport_expiry_date} />
          </Stack>
        </Stack>
      </Paper>

      {/* Addresses */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {`Addresses (${addresses.length})`}
        </Typography>
        <Divider sx={{ mb: 1.5 }} />

        {addresses.length === 0
          ? <Typography variant="body2" color="text.secondary">No addresses added.</Typography>
          : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Line 1</TableCell>
                      <TableCell>Line 2</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>State</TableCell>
                      <TableCell>Zip</TableCell>
                      <TableCell>Country</TableCell>
                      <TableCell>Primary</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {addresses.map((a, i) => (
                      <TableRow key={i}>
                        <TableCell>{a.address_type}</TableCell>
                        <TableCell>{a.line1 || '-'}</TableCell>
                        <TableCell>{a.line2 || '-'}</TableCell>
                        <TableCell>{a.city || '-'}</TableCell>
                        <TableCell>{a.state || '-'}</TableCell>
                        <TableCell>{a.zipcode || '-'}</TableCell>
                        <TableCell>{countryName(a.country)}</TableCell>
                        <TableCell>{a.is_primary ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
      </Paper>

      {/* Accounts */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {`Accounts (${accounts.length})`}
        </Typography>
        <Divider sx={{ mb: 1.5 }} />

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Account #</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Opened</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((a, i) => (
                <TableRow key={i}>
                  <TableCell>{a.acc_num || '-'}</TableCell>
                  <TableCell>{a.acc_name || '-'}</TableCell>
                  <TableCell>{a.acc_type || '-'}</TableCell>
                  <TableCell>{a.currency || '-'}</TableCell>
                  <TableCell>{a.branch || '-'}</TableCell>
                  <TableCell>{a.opened_date || '-'}</TableCell>
                  <TableCell align="right">
                    {a.balance === '' ? '-' : Number(a.balance).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={a.status}
                      size="small"
                      color={a.status === 'Active' ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Wealth Sources */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {`Sources of Wealth (${wealthSources.length})`}
        </Typography>
        <Divider sx={{ mb: 1.5 }} />

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Source Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Proof Ref</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wealthSources.map((w, i) => (
                <TableRow key={i}>
                  <TableCell>{w.source_type || '-'}</TableCell>
                  <TableCell>{w.description || '-'}</TableCell>
                  <TableCell align="right">
                    {w.amount === '' ? '-' : Number(w.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>{w.currency || '-'}</TableCell>
                  <TableCell>{countryName(w.country)}</TableCell>
                  <TableCell>{w.proof_ref || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Documents */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {`Reference Documents (${documents.length})`}
        </Typography>
        <Divider sx={{ mb: 1.5 }} />

        {documents.length === 0
          ? (
              <Typography variant="body2" color="text.secondary">
                No documents uploaded.
              </Typography>
            )
          : (
              <Stack spacing={1}>
                {documents.map((d, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="center">
                    <InsertDriveFileIcon fontSize="small" color="action" />
                    <Chip label={d.doc_type} size="small" variant="outlined" />
                    <Typography variant="body2">{d.fileName || 'No file'}</Typography>
                    {d.title && (
                      <Typography variant="caption" color="text.secondary">
                        {`— ${d.title}`}
                      </Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
      </Paper>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Tiny helper                                                        */
/* ------------------------------------------------------------------ */
function InfoItem({ label, value }: { label: string, value: string | number | null | undefined }) {
  return (
    <Typography variant="body2" sx={{ minWidth: 180 }}>
      <Typography component="span" variant="body2" fontWeight={600}>
        {`${label}:`}
      </Typography>
      {' '}
      {value === '' || value == null ? '-' : value}
    </Typography>
  );
}
