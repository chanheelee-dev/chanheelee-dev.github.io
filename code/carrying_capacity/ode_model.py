import scipy.integrate


def exp_growth_model(t, N, r):
    """Fixed r model (Exponential Growth)

    r: growth rate
    """
    dNdt = r * N
    return dNdt


def carrying_capacity_model(t, N, r, K):
    """Fixed r, K model (Logistic Growth)

    r: growth rate
    K: carrying capacity
    """
    dNdt = r * N - r / K * N ** 2
    return dNdt


def fixed_daily_nu_model(t, N, dN):
    """Fixed increment model"""
    return dN


def fixed_daily_nu_and_fixed_retention_model(t, N, dN, ret):
    """Fixed dN, retention model

    dN: daily increment
    ret: retention rate
    """
    dNdt = dN - (1 - ret) * N
    return dNdt


def solve_model(model, t_seq, n_0, *args):
    sol = scipy.integrate.solve_ivp(
        model,
        t_span=(t_seq[0], t_seq[-1]),
        y0=[n_0],
        args=args,
        t_eval=t_seq
    )

    return sol