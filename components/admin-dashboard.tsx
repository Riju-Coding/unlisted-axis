import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Package, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="flex-1 p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard Overview</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">{"%20 from last month"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{"+2350"}</div>
            <p className="text-xs text-muted-foreground">{"%180 from last month"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">{"%19 from last month"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shares Traded</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{"1,234,567"}</div>
            <p className="text-xs text-muted-foreground">{"%50 from last month"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Overview of recent user and listing activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New user registered</p>
                  <p className="text-sm text-muted-foreground">John Doe - 5 minutes ago</p>
                </div>
                <span className="text-sm text-green-500">Success</span>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New share listing added</p>
                  <p className="text-sm text-muted-foreground">ABC Corp. - 1 hour ago</p>
                </div>
                <span className="text-sm text-blue-500">Pending Review</span>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Share purchase completed</p>
                  <p className="text-sm text-muted-foreground">XYZ Ltd. - 3 hours ago</p>
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
