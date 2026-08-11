import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MetricInfo } from '@/components/metric-info'
import { buyinPerformance } from '@/lib/data'
import { usd, pct, num } from '@/lib/format'
import { cn } from '@/lib/utils'

export function BuyinPerformance() {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-1.5 text-base">
          Rendimiento por buy-in <MetricInfo metric="abi" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Torneos</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">ROI</TableHead>
              <TableHead className="text-right">ITM</TableHead>
              <TableHead className="text-right">ABI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buyinPerformance.map((row) => (
              <TableRow key={row.range}>
                <TableCell className="font-medium">{row.range}</TableCell>
                <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                  {num(row.tournaments)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-mono tabular-nums',
                    row.profit >= 0 ? 'text-profit' : 'text-loss',
                  )}
                >
                  {usd(row.profit, { sign: true })}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-mono tabular-nums',
                    row.roi >= 0 ? 'text-profit' : 'text-loss',
                  )}
                >
                  {pct(row.roi, { sign: true })}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                  {pct(row.itm)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                  {usd(row.abi, { decimals: 1 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
