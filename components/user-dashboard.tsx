import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, Clock } from "lucide-react"

export default function UserDashboard() {
  return (
    <div className="flex-1 p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6">User Dashboard Overview</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,345.67</div>
            <p className="text-xs text-muted-foreground">{"%5.2 increase"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Active Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">{"1 pending review"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">{"Awaiting confirmation"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>My Recent Activity</CardTitle>
            <CardDescription>Your latest share purchases and listings.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Purchased XYZ Ltd. shares</p>
                  <p className="text-sm text-muted-foreground">100 shares - 2 days ago</p>
                </div>
                <span className="text-sm text-green-500">Completed</span>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Listed DEF Inc. shares</p>
                  <p className="text-sm text-muted-foreground">50 shares - 4 days ago</p>
                </div>
                <span className="text-sm text-blue-500">Active</span>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sold GHI Corp. shares</p>
                  <p className="text-sm text-muted-foreground">200 shares - 1 week ago</p>
                </div>
                <span className="text-sm text-green-500">Completed</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
