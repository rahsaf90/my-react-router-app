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
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import type { IKycFormValues, KycDocumentType } from '~/lib/types/kyc';

const DOC_TYPE_LABELS: Record<KycDocumentType, string> = {
  passport: 'Passport',
  national_id: 'National ID',
  utility_bill: 'Utility Bill',
  bank_statement: 'Bank Statement',
  salary_slip: 'Salary Slip',
  tax_return: 'Tax Return',
  other: 'Other',
};

interface ReviewStepProps {
  values: IKycFormValues
}

export default function ReviewStep({ values }: ReviewStepProps) {
  const { customerInfo, accounts, wealthSources, documents } = values;

  return (
    <Stack spacing={3}>
      {/* Customer Info */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Customer Information
        </Typography>
        <Divider sx={{ mb: 1.5 }} />

        <Stack spacing={0.5}>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <InfoItem label="Full Name" value={customerInfo.fullName} />
            <InfoItem label="Date of Birth" value={customerInfo.dateOfBirth} />
            <InfoItem label="Gender" value={customerInfo.gender} />
          </Stack>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <InfoItem label="Nationality" value={customerInfo.nationality} />
            <InfoItem label="National ID" value={customerInfo.nationalId} />
          </Stack>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <InfoItem label="Email" value={customerInfo.email} />
            <InfoItem label="Phone" value={customerInfo.phone} />
          </Stack>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <InfoItem label="Address" value={customerInfo.address} />
            <InfoItem label="City" value={customerInfo.city} />
            <InfoItem label="Country" value={customerInfo.country} />
            <InfoItem label="Postal Code" value={customerInfo.postalCode} />
          </Stack>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <InfoItem label="Occupation" value={customerInfo.occupation} />
            <InfoItem label="Employer" value={customerInfo.employerName} />
          </Stack>
        </Stack>
      </Paper>

      {/* Accounts */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Account Details (
          {accounts.length}
          )
        </Typography>
        <Divider sx={{ mb: 1.5 }} />

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Account #</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Opening Date</TableCell>
                <TableCell align="right">Avg Balance</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((a, i) => (
                <TableRow key={i}>
                  <TableCell>{a.accountNumber || '-'}</TableCell>
                  <TableCell>{a.accountType || '-'}</TableCell>
                  <TableCell>{a.currency || '-'}</TableCell>
                  <TableCell>{a.branchName || '-'}</TableCell>
                  <TableCell>{a.openingDate || '-'}</TableCell>
                  <TableCell align="right">
                    {a.averageBalance.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={a.status}
                      size="small"
                      color={a.status === 'active' ? 'success' : 'default'}
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
          Sources of Wealth (
          {wealthSources.length}
          )
        </Typography>
        <Divider sx={{ mb: 1.5 }} />

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Source Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Estimated Value</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Evidence</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wealthSources.map((w, i) => (
                <TableRow key={i}>
                  <TableCell>{w.sourceType || '-'}</TableCell>
                  <TableCell>{w.description || '-'}</TableCell>
                  <TableCell align="right">
                    {w.estimatedValue.toLocaleString()}
                  </TableCell>
                  <TableCell>{w.currency || '-'}</TableCell>
                  <TableCell>{w.evidenceProvided || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Documents */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Reference Documents (
          {documents.length}
          )
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
                    <Chip
                      label={DOC_TYPE_LABELS[d.documentType] ?? d.documentType}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="body2">{d.fileName || 'No file'}</Typography>
                    {d.notes && (
                      <Typography variant="caption" color="text.secondary">
                        —
                        {' '}
                        {d.notes}
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
function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <Typography variant="body2" sx={{ minWidth: 180 }}>
      <Typography component="span" variant="body2" fontWeight={600}>
        {label}
        :
      </Typography>
      {' '}
      {value || '-'}
    </Typography>
  );
}
